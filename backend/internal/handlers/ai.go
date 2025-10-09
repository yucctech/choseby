package handlers

import (
	"net/http"

	"choseby-backend/internal/ai"
	"choseby-backend/internal/auth"
	"choseby-backend/internal/database"
	"choseby-backend/internal/models"

	"github.com/gin-gonic/gin"
)

// AIHandler handles DeepSeek AI integration for customer issue classification
type AIHandler struct {
	db          *database.DB
	authService *auth.Service
	aiService   *ai.Service
}

func NewAIHandler(db *database.DB, authService *auth.Service, apiKey string) *AIHandler {
	return &AIHandler{
		db:          db,
		authService: authService,
		aiService:   ai.NewAIService(apiKey, db),
	}
}

// ClassifyIssue uses AI to classify customer issues and provide recommendations
func (h *AIHandler) ClassifyIssue(c *gin.Context) {
	_, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req struct {
		DecisionID string `json:"decisionId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Decision ID required"})
		return
	}

	// Use the AI service to enhance the decision
	classification, recommendations, err := h.aiService.EnhanceDecisionWithAI(c.Request.Context(), req.DecisionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "AI classification failed",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"classification":           classification,
		"recommended_stakeholders": recommendations.RecommendedStakeholders,
		"suggested_criteria":       recommendations.SuggestedCriteria,
	})
}

// GenerateOptions uses AI to generate response options
func (h *AIHandler) GenerateOptions(c *gin.Context) {
	_, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req struct {
		DecisionID string `json:"decisionId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Decision ID required"})
		return
	}

	decisionID := req.DecisionID
	if decisionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Decision ID required"})
		return
	}

	// Get decision from database
	var decision models.CustomerDecision
	err := h.db.GetContext(c, &decision, `SELECT * FROM customer_decisions WHERE id = $1`, decisionID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Decision not found"})
		return
	}

	// Generate options using AI service
	options, err := h.aiService.SuggestResponseOptions(c.Request.Context(), decision)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "AI option generation failed",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"options": options,
	})
}
