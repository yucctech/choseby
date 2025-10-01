package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"choseby-backend/internal/auth"
	"choseby-backend/internal/database"
	"choseby-backend/internal/models"

	"github.com/gin-gonic/gin"
)

// AIHandler handles DeepSeek AI integration for customer issue classification
type AIHandler struct {
	db          *database.DB
	authService *auth.AuthService
	apiKey      string
	apiURL      string
	client      *http.Client
}

func NewAIHandler(db *database.DB, authService *auth.AuthService, apiKey string) *AIHandler {
	return &AIHandler{
		db:          db,
		authService: authService,
		apiKey:      apiKey,
		apiURL:      "https://api.deepseek.com/v1",
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// DeepSeek API structures
type DeepSeekRequest struct {
	Model       string    `json:"model"`
	Messages    []Message `json:"messages"`
	MaxTokens   int       `json:"max_tokens"`
	Temperature float64   `json:"temperature"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type DeepSeekResponse struct {
	Choices []Choice `json:"choices"`
	Usage   Usage    `json:"usage"`
}

type Choice struct {
	Message      Message `json:"message"`
	FinishReason string  `json:"finish_reason"`
}

type Usage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

// ClassifyIssue uses AI to classify customer issues and provide recommendations
func (h *AIHandler) ClassifyIssue(c *gin.Context) {
	if h.apiKey == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "AI service not configured"})
		return
	}

	_, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	type ClassifyRequest struct {
		CustomerContext struct {
			Name                       string  `json:"name" validate:"required"`
			Tier                       string  `json:"tier" validate:"required"`
			Value                      float64 `json:"value"`
			RelationshipDurationMonths int     `json:"relationship_duration_months"`
		} `json:"customer_context" validate:"required"`
		IssueDescription string   `json:"issue_description" validate:"required"`
		TeamRoles        []string `json:"team_roles" validate:"required"`
	}

	var req ClassifyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format", "details": err.Error()})
		return
	}

	// Create AI prompt for customer issue classification
	prompt := fmt.Sprintf(`You are an expert customer success analyst. Analyze this customer issue and provide a structured response.

Customer Context:
- Name: %s
- Tier: %s
- Annual Value: $%.2f
- Relationship Duration: %d months

Issue Description:
%s

Available Team Roles: %v

Please analyze this customer issue and provide a JSON response with:
1. decision_type (one of: refund_request, billing_dispute, service_escalation, policy_exception, contract_modification, churn_prevention)
2. urgency_level (1-5, where 5 is most urgent)
3. confidence_score (0.0-1.0)
4. risk_factors (array of strings describing potential risks)
5. recommended_stakeholders (array with role, weight 0.0-1.0, reasoning)
6. suggested_criteria (array with name, description, weight 0.1-5.0)

Focus on customer retention, relationship value, and urgency based on the issue description and customer context.`,
		req.CustomerContext.Name,
		req.CustomerContext.Tier,
		req.CustomerContext.Value,
		req.CustomerContext.RelationshipDurationMonths,
		req.IssueDescription,
		req.TeamRoles,
	)

	// Call DeepSeek API
	classification, err := h.callDeepSeekAPI(prompt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":    "AI classification failed",
			"fallback": h.getFallbackClassification(req),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"classification":           classification.Classification,
		"recommended_stakeholders": classification.RecommendedStakeholders,
		"suggested_criteria":       classification.SuggestedCriteria,
	})
}

// GenerateOptions uses AI to generate response options
func (h *AIHandler) GenerateOptions(c *gin.Context) {
	if h.apiKey == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "AI service not configured"})
		return
	}

	_, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	type GenerateOptionsRequest struct {
		DecisionContext struct {
			CustomerName    string  `json:"customer_name" validate:"required"`
			CustomerTier    string  `json:"customer_tier" validate:"required"`
			DecisionType    string  `json:"decision_type" validate:"required"`
			Description     string  `json:"description" validate:"required"`
			FinancialImpact float64 `json:"financial_impact"`
		} `json:"decision_context" validate:"required"`
		Criteria []struct {
			Name   string  `json:"name" validate:"required"`
			Weight float64 `json:"weight" validate:"required"`
		} `json:"criteria" validate:"required"`
	}

	var req GenerateOptionsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format", "details": err.Error()})
		return
	}

	// Create AI prompt for option generation
	criteriaStr := ""
	for _, c := range req.Criteria {
		criteriaStr += fmt.Sprintf("- %s (weight: %.1f)\n", c.Name, c.Weight)
	}

	prompt := fmt.Sprintf(`You are an expert customer success strategist. Generate response options for this customer issue.

Customer: %s (%s tier)
Issue Type: %s
Description: %s
Financial Impact: $%.2f

Evaluation Criteria:
%s

Generate 3-4 response options as a JSON array. Each option should have:
- title: Clear, action-oriented title
- description: Detailed explanation of the response
- financial_cost: Estimated cost to company
- implementation_effort: "low", "medium", or "high"
- risk_level: "low", "medium", or "high"
- reasoning: Why this option makes sense
- similar_cases: Array of examples where this approach worked

Focus on balancing customer satisfaction, cost control, and long-term relationship value. Consider the customer tier and relationship value in your recommendations.`,
		req.DecisionContext.CustomerName,
		req.DecisionContext.CustomerTier,
		req.DecisionContext.DecisionType,
		req.DecisionContext.Description,
		req.DecisionContext.FinancialImpact,
		criteriaStr,
	)

	// Call DeepSeek API
	optionsResponse, err := h.callDeepSeekForOptions(prompt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":    "AI option generation failed",
			"fallback": h.getFallbackOptions(req.DecisionContext.DecisionType),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"options": optionsResponse,
	})
}

// Helper methods

func (h *AIHandler) callDeepSeekAPI(prompt string) (*AIClassificationResponse, error) {
	reqBody := DeepSeekRequest{
		Model: "deepseek-chat",
		Messages: []Message{
			{
				Role:    "user",
				Content: prompt,
			},
		},
		MaxTokens:   1000,
		Temperature: 0.3,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", h.apiURL+"/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+h.apiKey)

	resp, err := h.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("DeepSeek API error: %d", resp.StatusCode)
	}

	var deepSeekResp DeepSeekResponse
	if err := json.NewDecoder(resp.Body).Decode(&deepSeekResp); err != nil {
		return nil, err
	}

	if len(deepSeekResp.Choices) == 0 {
		return nil, fmt.Errorf("no response from AI")
	}

	// Parse AI response
	var result AIClassificationResponse
	if err := json.Unmarshal([]byte(deepSeekResp.Choices[0].Message.Content), &result); err != nil {
		// If JSON parsing fails, return fallback
		return nil, fmt.Errorf("failed to parse AI response")
	}

	return &result, nil
}

func (h *AIHandler) callDeepSeekForOptions(prompt string) ([]ResponseOptionAI, error) {
	reqBody := DeepSeekRequest{
		Model: "deepseek-chat",
		Messages: []Message{
			{
				Role:    "user",
				Content: prompt,
			},
		},
		MaxTokens:   1500,
		Temperature: 0.4,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", h.apiURL+"/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+h.apiKey)

	resp, err := h.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("DeepSeek API error: %d", resp.StatusCode)
	}

	var deepSeekResp DeepSeekResponse
	if err := json.NewDecoder(resp.Body).Decode(&deepSeekResp); err != nil {
		return nil, err
	}

	if len(deepSeekResp.Choices) == 0 {
		return nil, fmt.Errorf("no response from AI")
	}

	// Parse AI response
	var result []ResponseOptionAI
	if err := json.Unmarshal([]byte(deepSeekResp.Choices[0].Message.Content), &result); err != nil {
		return nil, fmt.Errorf("failed to parse AI response")
	}

	return result, nil
}

// Response structures
type AIClassificationResponse struct {
	Classification struct {
		DecisionType    string   `json:"decision_type"`
		UrgencyLevel    int      `json:"urgency_level"`
		ConfidenceScore float64  `json:"confidence_score"`
		RiskFactors     []string `json:"risk_factors"`
	} `json:"classification"`
	RecommendedStakeholders []models.RecommendedStakeholder `json:"recommended_stakeholders"`
	SuggestedCriteria       []models.SuggestedCriterion     `json:"suggested_criteria"`
}

type ResponseOptionAI struct {
	Title                string   `json:"title"`
	Description          string   `json:"description"`
	FinancialCost        float64  `json:"financial_cost"`
	ImplementationEffort string   `json:"implementation_effort"`
	RiskLevel            string   `json:"risk_level"`
	Reasoning            string   `json:"reasoning"`
	SimilarCases         []string `json:"similar_cases"`
}

// Fallback methods when AI is not available
func (h *AIHandler) getFallbackClassification(req interface{}) interface{} {
	return gin.H{
		"classification": gin.H{
			"decision_type":    "service_escalation",
			"urgency_level":    3,
			"confidence_score": 0.5,
			"risk_factors":     []string{"Manual classification required"},
		},
		"recommended_stakeholders": []gin.H{
			{"role": "customer_success_manager", "weight": 0.4, "reasoning": "Primary customer relationship owner"},
			{"role": "support_manager", "weight": 0.3, "reasoning": "Technical expertise and service knowledge"},
		},
		"suggested_criteria": []gin.H{
			{"name": "Customer Satisfaction", "description": "Impact on customer happiness and retention", "weight": 1.5},
			{"name": "Financial Impact", "description": "Cost implications for the company", "weight": 1.0},
		},
	}
}

func (h *AIHandler) getFallbackOptions(decisionType string) []gin.H {
	switch decisionType {
	case "refund_request":
		return []gin.H{
			{
				"title":                 "Full Refund",
				"description":           "Provide complete monetary refund",
				"financial_cost":        0,
				"implementation_effort": "low",
				"risk_level":            "medium",
				"reasoning":             "Direct resolution but sets precedent",
			},
			{
				"title":                 "Partial Refund + Service Credit",
				"description":           "Combine partial refund with future service credits",
				"financial_cost":        0,
				"implementation_effort": "medium",
				"risk_level":            "low",
				"reasoning":             "Balances customer satisfaction with retention",
			},
		}
	default:
		return []gin.H{
			{
				"title":                 "Standard Resolution",
				"description":           "Apply standard company policy",
				"financial_cost":        0,
				"implementation_effort": "low",
				"risk_level":            "low",
				"reasoning":             "Consistent with policy guidelines",
			},
		}
	}
}
