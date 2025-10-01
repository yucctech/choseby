package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"choseby-backend/internal/models"
)

// DeepSeekClient handles interactions with DeepSeek API
type DeepSeekClient struct {
	apiKey      string
	baseURL     string
	httpClient  *http.Client
	rateLimiter *RateLimiter
}

// DeepSeekConfig holds configuration for DeepSeek API
type DeepSeekConfig struct {
	APIKey            string
	BaseURL           string
	Timeout           time.Duration
	MaxRequestsPerMin int
}

// NewDeepSeekClient creates a new DeepSeek API client
func NewDeepSeekClient(config DeepSeekConfig) *DeepSeekClient {
	if config.BaseURL == "" {
		config.BaseURL = "https://api.deepseek.com/v1"
	}
	if config.Timeout == 0 {
		config.Timeout = 30 * time.Second
	}
	if config.MaxRequestsPerMin == 0 {
		config.MaxRequestsPerMin = 60 // Conservative default
	}

	return &DeepSeekClient{
		apiKey:  config.APIKey,
		baseURL: config.BaseURL,
		httpClient: &http.Client{
			Timeout: config.Timeout,
		},
		rateLimiter: NewRateLimiter(config.MaxRequestsPerMin),
	}
}

// DeepSeekRequest represents a request to DeepSeek API
type DeepSeekRequest struct {
	Model       string    `json:"model"`
	Messages    []Message `json:"messages"`
	Temperature float64   `json:"temperature,omitempty"`
	MaxTokens   int       `json:"max_tokens,omitempty"`
}

// Message represents a chat message
type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// DeepSeekResponse represents a response from DeepSeek API
type DeepSeekResponse struct {
	ID      string   `json:"id"`
	Object  string   `json:"object"`
	Created int64    `json:"created"`
	Model   string   `json:"model"`
	Choices []Choice `json:"choices"`
	Usage   Usage    `json:"usage"`
}

// Choice represents a response choice
type Choice struct {
	Index        int     `json:"index"`
	Message      Message `json:"message"`
	FinishReason string  `json:"finish_reason"`
}

// Usage represents token usage
type Usage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

// ClassifyCustomerIssue analyzes customer issue and classifies it
func (c *DeepSeekClient) ClassifyCustomerIssue(ctx context.Context, issue string, description string, availableTypes []models.CustomerResponseType) (*models.AIClassification, error) {
	// Wait for rate limiter
	if err := c.rateLimiter.Wait(ctx); err != nil {
		return nil, fmt.Errorf("rate limit: %w", err)
	}

	// Build classification prompt with available response types
	typeDescriptions := make([]string, len(availableTypes))
	for i, t := range availableTypes {
		keywords := strings.Join(t.AIClassificationKeywords, ", ")
		typeDescriptions[i] = fmt.Sprintf("- %s (%s): %s (keywords: %s)",
			t.TypeCode, t.TypeName, *t.Description, keywords)
	}

	prompt := fmt.Sprintf(`You are a customer service AI assistant. Analyze the following customer issue and classify it.

Customer Issue: %s
Description: %s

Available response types:
%s

Task:
1. Classify the issue into one of the available response types based on keywords and context
2. Determine urgency level (1-5, where 5 is most urgent)
3. Provide confidence score (0.0-1.0)
4. List any risk factors that should be considered

Respond in JSON format:
{
  "decision_type": "type_code_here",
  "urgency_level": 4,
  "confidence_score": 0.85,
  "risk_factors": ["factor1", "factor2"]
}`,
		issue, description, strings.Join(typeDescriptions, "\n"))

	response, err := c.chat(ctx, prompt, "deepseek-chat", 500)
	if err != nil {
		return nil, err
	}

	// Parse JSON response
	var classification models.AIClassification
	if err := json.Unmarshal([]byte(response), &classification); err != nil {
		// Try to extract JSON from markdown code blocks
		cleaned := extractJSON(response)
		if err := json.Unmarshal([]byte(cleaned), &classification); err != nil {
			return nil, fmt.Errorf("failed to parse classification: %w", err)
		}
	}

	return &classification, nil
}

// RecommendStakeholders suggests team members who should be involved
func (c *DeepSeekClient) RecommendStakeholders(ctx context.Context, decision models.CustomerDecision, responseType *models.CustomerResponseType) (*models.AIRecommendations, error) {
	// Wait for rate limiter
	if err := c.rateLimiter.Wait(ctx); err != nil {
		return nil, fmt.Errorf("rate limit: %w", err)
	}

	// Build stakeholder recommendation prompt
	defaultStakeholders := ""
	if responseType != nil && len(responseType.DefaultStakeholders) > 0 {
		defaultStakeholders = strings.Join(responseType.DefaultStakeholders, ", ")
	}

	prompt := fmt.Sprintf(`You are a customer service AI assistant. Recommend stakeholders for this customer decision.

Customer Context:
- Name: %s
- Tier: %s (detailed: %s)
- Value: $%.2f
- Urgency: %d (%s)
- Impact Scope: %s
- Previous Issues: %d
- Issue Type: %s

Default Stakeholders for this type: %s

Decision:
- Title: %s
- Description: %s
- Financial Impact: $%.2f

Task: Recommend which stakeholders should be involved and their relative importance (weight 0.0-1.0).
Include reasoning for each recommendation.

Respond in JSON format:
{
  "recommended_stakeholders": [
    {
      "role": "customer_success_manager",
      "weight": 1.0,
      "reasoning": "Primary owner for enterprise customers"
    },
    {
      "role": "account_manager",
      "weight": 0.8,
      "reasoning": "High financial impact requires account management input"
    }
  ],
  "suggested_criteria": [
    {
      "name": "Customer Retention Risk",
      "description": "Likelihood of customer churn if handled poorly",
      "weight": 0.9
    }
  ]
}`,
		decision.CustomerName,
		decision.CustomerTier,
		decision.CustomerTierDetailed,
		safeFloat(decision.CustomerValue),
		decision.UrgencyLevel,
		decision.UrgencyLevelDetailed,
		decision.CustomerImpactScope,
		decision.PreviousIssuesCount,
		decision.DecisionType,
		defaultStakeholders,
		decision.Title,
		decision.Description,
		safeFloat(decision.FinancialImpact))

	response, err := c.chat(ctx, prompt, "deepseek-chat", 1000)
	if err != nil {
		return nil, err
	}

	// Parse JSON response
	var recommendations models.AIRecommendations
	if err := json.Unmarshal([]byte(response), &recommendations); err != nil {
		// Try to extract JSON from markdown code blocks
		cleaned := extractJSON(response)
		if err := json.Unmarshal([]byte(cleaned), &recommendations); err != nil {
			return nil, fmt.Errorf("failed to parse recommendations: %w", err)
		}
	}

	return &recommendations, nil
}

// chat sends a chat completion request to DeepSeek API
func (c *DeepSeekClient) chat(ctx context.Context, prompt string, model string, maxTokens int) (string, error) {
	reqBody := DeepSeekRequest{
		Model: model,
		Messages: []Message{
			{
				Role:    "user",
				Content: prompt,
			},
		},
		Temperature: 0.7,
		MaxTokens:   maxTokens,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", c.baseURL+"/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.apiKey)

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

	var apiResp DeepSeekResponse
	if err := json.Unmarshal(body, &apiResp); err != nil {
		return "", fmt.Errorf("failed to parse response: %w", err)
	}

	if len(apiResp.Choices) == 0 {
		return "", fmt.Errorf("no response choices returned")
	}

	return apiResp.Choices[0].Message.Content, nil
}

// Helper functions

func safeFloat(f *float64) float64 {
	if f == nil {
		return 0.0
	}
	return *f
}

func extractJSON(text string) string {
	// Remove markdown code blocks if present
	text = strings.TrimSpace(text)
	text = strings.TrimPrefix(text, "```json")
	text = strings.TrimPrefix(text, "```")
	text = strings.TrimSuffix(text, "```")
	return strings.TrimSpace(text)
}
