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

// PollinationsClient handles interactions with Pollinations.AI free API
type PollinationsClient struct {
	baseURL     string
	apiToken    string // Optional: speeds up requests 8x (0.78s vs 6.43s)
	httpClient  *http.Client
	rateLimiter *RateLimiter
}

// PollinationsConfig holds configuration for Pollinations API
type PollinationsConfig struct {
	APIToken          string // Optional but HIGHLY recommended (8x speed boost)
	BaseURL           string
	Timeout           time.Duration
	MaxRequestsPerMin int
}

// NewPollinationsClient creates a new Pollinations API client
func NewPollinationsClient(config PollinationsConfig) *PollinationsClient {
	if config.BaseURL == "" {
		config.BaseURL = "https://text.pollinations.ai"
	}
	if config.Timeout == 0 {
		config.Timeout = 30 * time.Second
	}
	if config.MaxRequestsPerMin == 0 {
		// With token: possibly higher limits (testing shows good performance)
		// Without token: 1 request / 3 sec = 20 req/min
		config.MaxRequestsPerMin = 60 // Conservative for token usage
	}

	return &PollinationsClient{
		baseURL:  config.BaseURL,
		apiToken: config.APIToken,
		httpClient: &http.Client{
			Timeout: config.Timeout,
		},
		rateLimiter: NewRateLimiter(config.MaxRequestsPerMin),
	}
}

// PollinationsRequest represents a request to Pollinations API
type PollinationsRequest struct {
	Messages         []Message              `json:"messages"`
	Model            string                 `json:"model"`
	Temperature      float64                `json:"temperature,omitempty"`
	TopP             float64                `json:"top_p,omitempty"`
	FrequencyPenalty float64                `json:"frequency_penalty,omitempty"`
	PresencePenalty  float64                `json:"presence_penalty,omitempty"`
	Seed             int                    `json:"seed,omitempty"`
	ResponseFormat   map[string]interface{} `json:"response_format,omitempty"`
	Stream           bool                   `json:"stream,omitempty"`
	Private          bool                   `json:"private,omitempty"`
}

// ClassifyCustomerIssue analyzes customer issue using free Pollinations API
func (c *PollinationsClient) ClassifyCustomerIssue(ctx context.Context, issue string, description string, availableTypes []models.CustomerResponseType) (*models.AIClassification, error) {
	// Wait for rate limiter
	if err := c.rateLimiter.Wait(ctx); err != nil {
		return nil, fmt.Errorf("rate limit: %w", err)
	}

	// Build classification prompt (simplified for free API)
	typeDescriptions := make([]string, len(availableTypes))
	for i, t := range availableTypes {
		keywords := strings.Join(t.AIClassificationKeywords, ", ")
		typeDescriptions[i] = fmt.Sprintf("- %s: %s", t.TypeCode, keywords)
	}

	prompt := fmt.Sprintf(`Classify this customer issue.

Issue: %s
Description: %s

Available types:
%s

Respond ONLY with JSON (no markdown, no explanation):
{
  "decision_type": "type_code_here",
  "urgency_level": 4,
  "confidence_score": 0.85,
  "risk_factors": ["factor1", "factor2"]
}`,
		issue, description, strings.Join(typeDescriptions, "\n"))

	response, err := c.chat(ctx, prompt)
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
func (c *PollinationsClient) RecommendStakeholders(ctx context.Context, decision models.CustomerDecision, responseType *models.CustomerResponseType) (*models.AIRecommendations, error) {
	// Wait for rate limiter
	if err := c.rateLimiter.Wait(ctx); err != nil {
		return nil, fmt.Errorf("rate limit: %w", err)
	}

	// Build stakeholder recommendation prompt (simplified)
	defaultStakeholders := ""
	if responseType != nil && len(responseType.DefaultStakeholders) > 0 {
		defaultStakeholders = strings.Join(responseType.DefaultStakeholders, ", ")
	}

	prompt := fmt.Sprintf(`Recommend stakeholders for this customer decision.

Customer: %s, Tier: %s, Value: $%.2f, Urgency: %d
Issue: %s
Default Stakeholders: %s

Respond ONLY with JSON (no markdown):
{
  "recommended_stakeholders": [
    {"role": "customer_success_manager", "weight": 1.0, "reasoning": "..."}
  ],
  "suggested_criteria": [
    {"name": "Retention Risk", "description": "...", "weight": 0.9}
  ]
}`,
		decision.CustomerName,
		decision.CustomerTier,
		safeFloat(decision.CustomerValue),
		decision.UrgencyLevel,
		decision.Title,
		defaultStakeholders)

	response, err := c.chat(ctx, prompt)
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
func (c *PollinationsClient) GenerateResponseDraft(ctx context.Context, req ResponseDraftRequest) (*ResponseDraft, error) {
	// Wait for rate limiter
	if err := c.rateLimiter.Wait(ctx); err != nil {
		return nil, fmt.Errorf("rate limit: %w", err)
	}

	// Build simplified prompt for free API
	customerEmail := ""
	if req.CustomerContext.CustomerEmail != nil {
		customerEmail = *req.CustomerContext.CustomerEmail
	}

	prompt := fmt.Sprintf(`Generate a customer response draft.

Customer: %s (%s), Tier: %s
Issue: %s - %s
Decision: %s
Tone: %s

Respond ONLY with JSON (no markdown):
{
  "draft_content": "Full response text (150-300 words)",
  "key_points": ["point1", "point2", "point3"],
  "tone": "%s",
  "estimated_satisfaction_impact": "positive",
  "follow_up_recommendations": ["rec1", "rec2"]
}`,
		req.CustomerContext.CustomerName,
		customerEmail,
		req.CustomerContext.CustomerTier,
		req.CustomerContext.Title,
		req.CustomerContext.Description,
		req.DecisionOutcome.SelectedOptionTitle,
		req.CommunicationPreferences.Tone,
		req.CommunicationPreferences.Tone)

	response, err := c.chat(ctx, prompt)
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

// chat sends a chat completion request to Pollinations API
func (c *PollinationsClient) chat(ctx context.Context, prompt string) (string, error) {
	reqBody := PollinationsRequest{
		Messages: []Message{
			{
				Role:    "system",
				Content: "You are a helpful assistant. Always respond with valid JSON only, no markdown code blocks.",
			},
			{
				Role:    "user",
				Content: prompt,
			},
		},
		Model: "openai", // Pollinations uses "openai" model identifier

		// Optimized parameters for Pollinations API
		// NOTE: Temperature is NOT supported (API returns 400 error)
		// Only default temperature (1.0) works
		ResponseFormat: map[string]interface{}{"type": "json_object"}, // Force JSON output
		Private:        true,                                          // Don't add to public feed
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", c.baseURL+"/", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	// Add authentication token if provided (8x speed boost!)
	if c.apiToken != "" {
		req.Header.Set("Authorization", "Bearer "+c.apiToken)
	}

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

	// Pollinations returns raw text response (not OpenAI format)
	// It should already be JSON from our prompt
	return string(body), nil
}
