package handlers

import (
	"net/http"
	"time"

	"choseby-backend/internal/auth"
	"choseby-backend/internal/database"
	"choseby-backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// OutcomeHandler handles outcome tracking and AI learning feedback
type OutcomeHandler struct {
	db          *database.DB
	authService *auth.AuthService
}

func NewOutcomeHandler(db *database.DB, authService *auth.AuthService) *OutcomeHandler {
	return &OutcomeHandler{
		db:          db,
		authService: authService,
	}
}

// RecordOutcome records the actual outcome of a customer response decision
func (h *OutcomeHandler) RecordOutcome(c *gin.Context) {
	decisionID := c.Param("id")
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	type OutcomeRequest struct {
		CustomerSatisfactionScore *int       `json:"customer_satisfaction_score" validate:"omitempty,min=1,max=10"`
		EscalationOccurred        bool       `json:"escalation_occurred"`
		EscalationLevel           *string    `json:"escalation_level,omitempty" validate:"omitempty,oneof=none supervisor management executive legal"`
		FinancialImpactActual     *float64   `json:"financial_impact_actual,omitempty"`
		ResolutionTimeHours       *int       `json:"resolution_time_hours,omitempty"`
		CustomerRetentionImpact   *string    `json:"customer_retention_impact,omitempty" validate:"omitempty,oneof=positive neutral negative churn_risk churn_occurred"`
		FollowUpRequired          bool       `json:"follow_up_required"`
		FollowUpScheduledDate     *time.Time `json:"follow_up_scheduled_date,omitempty"`
		OutcomeNotes              *string    `json:"outcome_notes,omitempty"`
		ResponseDraftUsed         bool       `json:"response_draft_used"`
		ResponseDraftVersion      *int       `json:"response_draft_version,omitempty"`
	}

	var req OutcomeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format", "details": err.Error()})
		return
	}

	// Verify user can access this decision
	var decision models.CustomerDecision
	err := h.db.GetContext(c, &decision, `
		SELECT cd.* FROM customer_decisions cd
		JOIN team_members tm ON cd.team_id = tm.team_id
		WHERE cd.id = $1 AND tm.id = $2 AND tm.is_active = true
	`, decisionID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Decision not found or access denied"})
		return
	}

	// Check if outcome already exists
	var existingID *uuid.UUID
	err = h.db.GetContext(c, &existingID, `
		SELECT id FROM outcome_tracking WHERE decision_id = $1
	`, decisionID)

	now := time.Now()

	if existingID == nil {
		// Create new outcome
		outcomeID := uuid.New()
		_, err = h.db.ExecContext(c, `
			INSERT INTO outcome_tracking (
				id, decision_id, customer_satisfaction_score, escalation_occurred,
				escalation_level, financial_impact_actual, resolution_time_hours,
				customer_retention_impact, follow_up_required, follow_up_scheduled_date,
				outcome_notes, response_draft_used, response_draft_version,
				created_at, updated_at
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
		`,
			outcomeID, decisionID, req.CustomerSatisfactionScore, req.EscalationOccurred,
			req.EscalationLevel, req.FinancialImpactActual, req.ResolutionTimeHours,
			req.CustomerRetentionImpact, req.FollowUpRequired, req.FollowUpScheduledDate,
			req.OutcomeNotes, req.ResponseDraftUsed, req.ResponseDraftVersion,
			now, now,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record outcome", "details": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message":    "Outcome recorded successfully",
			"outcome_id": outcomeID,
		})
	} else {
		// Update existing outcome
		_, err = h.db.ExecContext(c, `
			UPDATE outcome_tracking SET
				customer_satisfaction_score = $1,
				escalation_occurred = $2,
				escalation_level = $3,
				financial_impact_actual = $4,
				resolution_time_hours = $5,
				customer_retention_impact = $6,
				follow_up_required = $7,
				follow_up_scheduled_date = $8,
				outcome_notes = $9,
				response_draft_used = $10,
				response_draft_version = $11,
				updated_at = $12
			WHERE id = $13
		`,
			req.CustomerSatisfactionScore, req.EscalationOccurred, req.EscalationLevel,
			req.FinancialImpactActual, req.ResolutionTimeHours, req.CustomerRetentionImpact,
			req.FollowUpRequired, req.FollowUpScheduledDate, req.OutcomeNotes,
			req.ResponseDraftUsed, req.ResponseDraftVersion, now, existingID,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update outcome", "details": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message":    "Outcome updated successfully",
			"outcome_id": existingID,
		})
	}
}

// GetOutcome retrieves outcome data for a decision
func (h *OutcomeHandler) GetOutcome(c *gin.Context) {
	decisionID := c.Param("id")
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Verify user can access this decision
	var teamID uuid.UUID
	err := h.db.GetContext(c, &teamID, `
		SELECT cd.team_id FROM customer_decisions cd
		JOIN team_members tm ON cd.team_id = tm.team_id
		WHERE cd.id = $1 AND tm.id = $2 AND tm.is_active = true
	`, decisionID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Decision not found or access denied"})
		return
	}

	// Get outcome
	var outcome models.OutcomeTracking
	err = h.db.GetContext(c, &outcome, `
		SELECT * FROM outcome_tracking WHERE decision_id = $1
	`, decisionID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No outcome recorded yet"})
		return
	}

	c.JSON(http.StatusOK, outcome)
}

// RecordAIFeedback records feedback on AI recommendation accuracy
func (h *OutcomeHandler) RecordAIFeedback(c *gin.Context) {
	decisionID := c.Param("id")
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	type AIFeedbackRequest struct {
		RecommendationType        string   `json:"recommendation_type" validate:"required,oneof=classification stakeholder_suggestion response_draft risk_assessment"`
		AISuggestion              string   `json:"ai_suggestion" validate:"required"`
		StakeholderApprovalRating *int     `json:"stakeholder_approval_rating,omitempty" validate:"omitempty,min=1,max=5"`
		FinalDecisionAlignment    bool     `json:"final_decision_alignment"`
		AccuracyScore             *float64 `json:"accuracy_score,omitempty" validate:"omitempty,min=0,max=1"`
		ImprovementSuggestions    *string  `json:"improvement_suggestions,omitempty"`
		AIConfidenceScore         *float64 `json:"ai_confidence_score,omitempty"`
	}

	var req AIFeedbackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format", "details": err.Error()})
		return
	}

	// Verify user can access this decision
	var teamID uuid.UUID
	err := h.db.GetContext(c, &teamID, `
		SELECT cd.team_id FROM customer_decisions cd
		JOIN team_members tm ON cd.team_id = tm.team_id
		WHERE cd.id = $1 AND tm.id = $2 AND tm.is_active = true
	`, decisionID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Decision not found or access denied"})
		return
	}

	// Insert AI feedback
	feedbackID := uuid.New()
	now := time.Now()
	_, err = h.db.ExecContext(c, `
		INSERT INTO ai_recommendation_feedback (
			id, decision_id, recommendation_type, ai_suggestion,
			stakeholder_approval_rating, final_decision_alignment,
			accuracy_score, improvement_suggestions, ai_confidence_score,
			created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`,
		feedbackID, decisionID, req.RecommendationType, req.AISuggestion,
		req.StakeholderApprovalRating, req.FinalDecisionAlignment,
		req.AccuracyScore, req.ImprovementSuggestions, req.AIConfidenceScore,
		now, now,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record AI feedback", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":     "AI feedback recorded successfully",
		"feedback_id": feedbackID,
	})
}

// GetAIFeedback retrieves all AI feedback for a decision
func (h *OutcomeHandler) GetAIFeedback(c *gin.Context) {
	decisionID := c.Param("id")
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Verify user can access this decision
	var teamID uuid.UUID
	err := h.db.GetContext(c, &teamID, `
		SELECT cd.team_id FROM customer_decisions cd
		JOIN team_members tm ON cd.team_id = tm.team_id
		WHERE cd.id = $1 AND tm.id = $2 AND tm.is_active = true
	`, decisionID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Decision not found or access denied"})
		return
	}

	// Get all feedback
	type AIFeedback struct {
		ID                        uuid.UUID `json:"id" db:"id"`
		RecommendationType        string    `json:"recommendation_type" db:"recommendation_type"`
		AISuggestion              string    `json:"ai_suggestion" db:"ai_suggestion"`
		StakeholderApprovalRating *int      `json:"stakeholder_approval_rating" db:"stakeholder_approval_rating"`
		FinalDecisionAlignment    bool      `json:"final_decision_alignment" db:"final_decision_alignment"`
		AccuracyScore             *float64  `json:"accuracy_score" db:"accuracy_score"`
		ImprovementSuggestions    *string   `json:"improvement_suggestions" db:"improvement_suggestions"`
		AIConfidenceScore         *float64  `json:"ai_confidence_score" db:"ai_confidence_score"`
		CreatedAt                 time.Time `json:"created_at" db:"created_at"`
	}

	var feedback []AIFeedback
	err = h.db.SelectContext(c, &feedback, `
		SELECT id, recommendation_type, ai_suggestion, stakeholder_approval_rating,
		       final_decision_alignment, accuracy_score, improvement_suggestions,
		       ai_confidence_score, created_at
		FROM ai_recommendation_feedback
		WHERE decision_id = $1
		ORDER BY created_at DESC
	`, decisionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve AI feedback"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"feedback": feedback,
		"total":    len(feedback),
	})
}
