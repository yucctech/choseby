package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"choseby-backend/internal/models"
)

// OllamaClient handles interactions with local Ollama instance
type OllamaClient struct {
	baseURL    string
	model      string
	httpClient *http.Client
}

// NewOllamaClient creates a new Ollama client for local inference
func NewOllamaClient(model string) *OllamaClient {
	if model == "" {
		model = "deepseek-r1:1.5b"
	}

	return &OllamaClient{
		baseURL:    "http://localhost:11434",
		model:      model,
		httpClient: &http.Client{},
	}
}

// OllamaRequest represents a request to Ollama API
type OllamaRequest struct {
	Model  string `json:"model"`
	Prompt string `json:"prompt"`
	Stream bool   `json:"stream"`
}

// OllamaResponse represents a response from Ollama API
type OllamaResponse struct {
	Model     string `json:"model"`
	CreatedAt string `json:"created_at"`
	Response  string `json:"response"`
	Done      bool   `json:"done"`
}

// Generate sends a prompt to Ollama and returns the response
func (c *OllamaClient) generate(ctx context.Context, prompt string) (string, error) {
	reqBody := OllamaRequest{
		Model:  c.model,
		Prompt: prompt,
		Stream: false,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", c.baseURL+"/api/generate", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(body))
	}

	var apiResp OllamaResponse
	if err := json.Unmarshal(body, &apiResp); err != nil {
		return "", fmt.Errorf("failed to parse response: %w", err)
	}

	return apiResp.Response, nil
}

// ClassifyCustomerIssue analyzes customer issue using local Ollama model
func (c *OllamaClient) ClassifyCustomerIssue(ctx context.Context, issue string, description string, availableTypes []models.CustomerResponseType) (*models.AIClassification, error) {
	// Build classification prompt (same as DeepSeek client)
	typeDescriptions := make([]string, len(availableTypes))
	for i, t := range availableTypes {
		keywords := ""
		if len(t.AIClassificationKeywords) > 0 {
			keywords = t.AIClassificationKeywords[0]
			for j := 1; j < len(t.AIClassificationKeywords); j++ {
				keywords += ", " + t.AIClassificationKeywords[j]
			}
		}
		desc := ""
		if t.Description != nil {
			desc = *t.Description
		}
		typeDescriptions[i] = fmt.Sprintf("- %s (%s): %s (keywords: %s)",
			t.TypeCode, t.TypeName, desc, keywords)
	}

	typeList := ""
	for _, td := range typeDescriptions {
		typeList += td + "\n"
	}

	prompt := fmt.Sprintf(`Classify this customer issue into one of the available types.

CUSTOMER ISSUE:
Title: %s
Description: %s

AVAILABLE TYPES:
%s

INSTRUCTIONS:
1. Match the issue to ONE of the type codes above based on keywords
2. Rate urgency 1-5 (1=low, 5=critical)
3. Give confidence 0.0-1.0 (how certain you are)
4. List 1-3 risk factors

OUTPUT FORMAT (JSON only, no other text):
{"decision_type":"type_code","urgency_level":4,"confidence_score":0.85,"risk_factors":["risk1","risk2"]}`,
		issue, description, typeList)

	response, err := c.generate(ctx, prompt)
	if err != nil {
		return nil, err
	}

	// DeepSeek R1 reasoning model outputs <think> tags - extract JSON only
	cleaned := extractReasoningJSON(response)

	// Parse JSON response
	var classification models.AIClassification
	if err := json.Unmarshal([]byte(cleaned), &classification); err != nil {
		return nil, fmt.Errorf("failed to parse classification: %w (response: %s)", err, cleaned)
	}

	return &classification, nil
}

// RecommendStakeholders suggests team members using local model
func (c *OllamaClient) RecommendStakeholders(ctx context.Context, decision models.CustomerDecision, responseType *models.CustomerResponseType) (*models.AIRecommendations, error) {
	// Build stakeholder recommendation prompt (simplified from DeepSeek version)
	defaultStakeholders := ""
	if responseType != nil && len(responseType.DefaultStakeholders) > 0 {
		for i, s := range responseType.DefaultStakeholders {
			if i > 0 {
				defaultStakeholders += ", "
			}
			defaultStakeholders += s
		}
	}

	customerValue := 0.0
	if decision.CustomerValue != nil {
		customerValue = *decision.CustomerValue
	}
	financialImpact := 0.0
	if decision.FinancialImpact != nil {
		financialImpact = *decision.FinancialImpact
	}

	prompt := fmt.Sprintf(`You are a customer service AI assistant. Recommend stakeholders for this customer decision.

Customer Context:
- Name: %s
- Tier: %s
- Value: $%.2f
- Urgency: %d
- Previous Issues: %d

Default Stakeholders for this type: %s

Decision:
- Title: %s
- Description: %s
- Financial Impact: $%.2f

Task: Recommend which stakeholders should be involved and their relative importance (weight 0.0-1.0).

Respond ONLY with valid JSON (no markdown, no explanations):
{
  "recommended_stakeholders": [
    {
      "role": "customer_success_manager",
      "weight": 1.0,
      "reasoning": "Primary owner for enterprise customers"
    }
  ],
  "suggested_criteria": [
    {
      "name": "Customer Retention Risk",
      "description": "Likelihood of customer churn",
      "weight": 0.9
    }
  ]
}`,
		decision.CustomerName,
		decision.CustomerTier,
		customerValue,
		decision.UrgencyLevel,
		decision.PreviousIssuesCount,
		defaultStakeholders,
		decision.Title,
		decision.Description,
		financialImpact)

	response, err := c.generate(ctx, prompt)
	if err != nil {
		return nil, err
	}

	// DeepSeek R1 reasoning model outputs <think> tags - extract JSON only
	cleaned := extractReasoningJSON(response)

	// Parse JSON response
	var recommendations models.AIRecommendations
	if err := json.Unmarshal([]byte(cleaned), &recommendations); err != nil {
		return nil, fmt.Errorf("failed to parse recommendations: %w (response: %s)", err, cleaned)
	}

	return &recommendations, nil
}

// extractReasoningJSON removes <think> tags and extracts JSON from DeepSeek R1 reasoning output
func extractReasoningJSON(response string) string {
	// DeepSeek R1 outputs: <think>reasoning...</think>\n{json}
	// or: <think>reasoning...</think>\n```json\n{json}\n```

	// Remove <think> blocks
	start := 0
	for {
		thinkStart := bytes.Index([]byte(response[start:]), []byte("<think>"))
		if thinkStart == -1 {
			break
		}
		thinkStart += start
		thinkEnd := bytes.Index([]byte(response[thinkStart:]), []byte("</think>"))
		if thinkEnd == -1 {
			break
		}
		thinkEnd += thinkStart + len("</think>")
		response = response[:thinkStart] + response[thinkEnd:]
		start = thinkStart
	}

	// Now extract JSON using existing extractJSON function
	return extractJSON(response)
}
