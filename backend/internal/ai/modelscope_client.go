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

// ModelScopeClient handles interactions with ModelScope API (OpenAI-compatible)
type ModelScopeClient struct {
	apiKey      string
	baseURL     string
	model       string
	httpClient  *http.Client
	rateLimiter *RateLimiter
}

// ModelScopeConfig holds configuration for ModelScope API
type ModelScopeConfig struct {
	APIKey            string
	Model             string // e.g., "qwen-max", "Qwen/Qwen3-30B-A3B"
	BaseURL           string
	Timeout           time.Duration
	MaxRequestsPerMin int
}

// NewModelScopeClient creates a new ModelScope API client
func NewModelScopeClient(config ModelScopeConfig) *ModelScopeClient {
	if config.BaseURL == "" {
		config.BaseURL = "https://api-inference.modelscope.cn/v1"
	}
	if config.Model == "" {
		config.Model = "qwen-max" // Default to Qwen Max
	}
	if config.Timeout == 0 {
		config.Timeout = 30 * time.Second
	}
	if config.MaxRequestsPerMin == 0 {
		// ModelScope free tier: 2000 calls/day = ~83 calls/hour = ~1.4 calls/min
		// Conservative: 60 calls/min (will be throttled by daily quota anyway)
		config.MaxRequestsPerMin = 60
	}

	return &ModelScopeClient{
		apiKey:  config.APIKey,
		baseURL: config.BaseURL,
		model:   config.Model,
		httpClient: &http.Client{
			Timeout: config.Timeout,
		},
		rateLimiter: NewRateLimiter(config.MaxRequestsPerMin),
	}
}

// ClassifyCustomerIssue analyzes customer issue using ModelScope Qwen models
func (c *ModelScopeClient) ClassifyCustomerIssue(ctx context.Context, issue string, description string, availableTypes []models.CustomerResponseType) (*models.AIClassification, error) {
	// Wait for rate limiter
	if err := c.rateLimiter.Wait(ctx); err != nil {
		return nil, fmt.Errorf("rate limit: %w", err)
	}

	// Build classification prompt (same as DeepSeek)
	typeDescriptions := make([]string, len(availableTypes))
	for i, t := range availableTypes {
		keywords := strings.Join(t.AIClassificationKeywords, ", ")
		desc := ""
		if t.Description != nil {
			desc = *t.Description
		}
		typeDescriptions[i] = fmt.Sprintf("- %s (%s): %s (keywords: %s)",
			t.TypeCode, t.TypeName, desc, keywords)
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

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "decision_type": "type_code_here",
  "urgency_level": 4,
  "confidence_score": 0.85,
  "risk_factors": ["factor1", "factor2"]
}`,
		issue, description, strings.Join(typeDescriptions, "\n"))

	response, err := c.chat(ctx, prompt, 500)
	if err != nil {
		return nil, err
	}

	// Parse JSON response
	var classification models.AIClassification
	if err := json.Unmarshal([]byte(response), &classification); err != nil {
		// Try to extract JSON from markdown code blocks
		cleaned := extractJSON(response)
		if err := json.Unmarshal([]byte(cleaned), &classification); err != nil {
			return nil, fmt.Errorf("failed to parse classification: %w (response: %s)", err, cleaned)
		}
	}

	return &classification, nil
}

// RecommendStakeholders suggests team members who should be involved
func (c *ModelScopeClient) RecommendStakeholders(ctx context.Context, decision models.CustomerDecision, responseType *models.CustomerResponseType) (*models.AIRecommendations, error) {
	// Wait for rate limiter
	if err := c.rateLimiter.Wait(ctx); err != nil {
		return nil, fmt.Errorf("rate limit: %w", err)
	}

	// Build stakeholder recommendation prompt (same as DeepSeek)
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

Respond ONLY with valid JSON (no markdown, no code blocks):
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

	response, err := c.chat(ctx, prompt, 1000)
	if err != nil {
		return nil, err
	}

	// Parse JSON response
	var recommendations models.AIRecommendations
	if err := json.Unmarshal([]byte(response), &recommendations); err != nil {
		// Try to extract JSON from markdown code blocks
		cleaned := extractJSON(response)
		if err := json.Unmarshal([]byte(cleaned), &recommendations); err != nil {
			return nil, fmt.Errorf("failed to parse recommendations: %w (response: %s)", err, cleaned)
		}
	}

	return &recommendations, nil
}

// GenerateResponseDraft creates an AI-powered customer response draft
func (c *ModelScopeClient) GenerateResponseDraft(ctx context.Context, req ResponseDraftRequest) (*ResponseDraft, error) {
	// Wait for rate limiter
	if err := c.rateLimiter.Wait(ctx); err != nil {
		return nil, fmt.Errorf("rate limit: %w", err)
	}

	// Build tone-specific instructions
	toneInstructions := getToneInstructions(req.CommunicationPreferences.Tone)

	// Build comprehensive prompt with customer context and decision outcome
	customerEmail := ""
	if req.CustomerContext.CustomerEmail != nil {
		customerEmail = *req.CustomerContext.CustomerEmail
	}

	prompt := fmt.Sprintf(`You are a professional customer service communication assistant. Generate a customer response draft based on the team's decision.

Customer Context:
- Name: %s
- Email: %s
- Tier: %s (%s)
- Relationship: %d months
- Previous Issues: %d
- NPS Score: %s
- Customer Value: $%.2f

Issue Details:
- Title: %s
- Description: %s
- Decision Type: %s
- Urgency: %d (%s)
- Financial Impact: $%.2f

Team Decision:
- Selected Response: %s
- Reasoning: %s
- Team Consensus: %.2f (0.0-1.0 scale)
- Weighted Score: %.2f

Selected Option Details:
%s

Communication Preferences:
- Tone: %s
- Channel: %s
- Urgency: %s

%s

Task: Generate a complete customer response that:
1. Acknowledges the customer's issue and its impact
2. Explains the team's decision and reasoning clearly
3. Provides specific details about the resolution (compensation, timeline, next steps)
4. Reinforces the value of the customer relationship
5. Sets clear expectations for follow-up if needed

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "draft_content": "Full response text here (150-300 words)",
  "key_points": ["Key point 1", "Key point 2", "Key point 3"],
  "tone": "%s",
  "estimated_satisfaction_impact": "positive|neutral|negative",
  "follow_up_recommendations": ["Recommendation 1", "Recommendation 2"]
}`,
		req.CustomerContext.CustomerName,
		customerEmail,
		req.CustomerContext.CustomerTier,
		req.CustomerContext.CustomerTierDetailed,
		req.CustomerContext.RelationshipDurationMonths,
		req.CustomerContext.PreviousIssuesCount,
		formatNPSScore(req.CustomerContext.NPSScore),
		safeFloat(req.CustomerContext.CustomerValue),
		req.CustomerContext.Title,
		req.CustomerContext.Description,
		req.CustomerContext.DecisionType,
		req.CustomerContext.UrgencyLevel,
		req.CustomerContext.UrgencyLevelDetailed,
		safeFloat(req.CustomerContext.FinancialImpact),
		req.DecisionOutcome.SelectedOptionTitle,
		req.DecisionOutcome.Reasoning,
		req.DecisionOutcome.TeamConsensus,
		req.DecisionOutcome.WeightedScore,
		formatSelectedOption(req.SelectedOption),
		req.CommunicationPreferences.Tone,
		req.CommunicationPreferences.Channel,
		req.CommunicationPreferences.Urgency,
		toneInstructions,
		req.CommunicationPreferences.Tone)

	response, err := c.chat(ctx, prompt, 1500)
	if err != nil {
		return nil, err
	}

	// Parse JSON response
	var draft ResponseDraft
	if err := json.Unmarshal([]byte(response), &draft); err != nil {
		// Try to extract JSON from markdown code blocks
		cleaned := extractJSON(response)
		if err := json.Unmarshal([]byte(cleaned), &draft); err != nil {
			return nil, fmt.Errorf("failed to parse draft: %w (response: %s)", err, cleaned)
		}
	}

	return &draft, nil
}

// chat sends a chat completion request to ModelScope API (OpenAI-compatible)
func (c *ModelScopeClient) chat(ctx context.Context, prompt string, maxTokens int) (string, error) {
	// ModelScope uses OpenAI-compatible format
	reqBody := DeepSeekRequest{
		Model: c.model,
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
