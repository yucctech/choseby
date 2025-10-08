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
		SelectedOptionID          string     `json:"selected_option_id"`
		DecisionDate              *time.Time `json:"decision_date,omitempty"`
		ResponseSentDate          *time.Time `json:"response_sent_date,omitempty"`
		TimeToFirstResponseHours  *float64   `json:"time_to_first_response_hours,omitempty"`
		TimeToResolutionHours     *float64   `json:"time_to_resolution_hours,omitempty"`
		CustomerSatisfactionScore *int       `json:"customer_satisfaction_score,omitempty" validate:"omitempty,min=1,max=5"`
		NPSScoreChange            *int       `json:"nps_score_change,omitempty"`
		CustomerFeedback          *string    `json:"customer_feedback,omitempty"`
		TeamConsensusScore        *float64   `json:"team_consensus_score,omitempty"`
		AIAccuracyRating          *int       `json:"ai_accuracy_rating,omitempty"`
		ActualCost                *float64   `json:"actual_cost,omitempty"`
		RevenueImpact             *float64   `json:"revenue_impact,omitempty"`
		LessonsLearned            *string    `json:"lessons_learned,omitempty"`
		WouldDecideSameAgain      *bool      `json:"would_decide_same_again,omitempty"`
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
	var existingOutcome models.OutcomeTracking
	err = h.db.GetContext(c, &existingOutcome, `
		SELECT * FROM outcome_tracking WHERE decision_id = $1
	`, decisionID)
	if err == nil {
		existingID = &existingOutcome.ID
	}

	now := time.Now()

	if existingID == nil {
		// Create new outcome
		outcomeID := uuid.New()
		_, err = h.db.ExecContext(c, `
			INSERT INTO outcome_tracking (
				id, decision_id, decision_created_at, first_response_at, resolution_at,
				time_to_first_response_hours, time_to_resolution_hours,
				customer_satisfaction_score, nps_change, escalation_occurred,
				team_consensus_score, lessons_learned,
				estimated_financial_impact, actual_financial_impact,
				created_at, updated_at
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
		`,
			outcomeID, decisionID, decision.CreatedAt, req.ResponseSentDate, req.ResponseSentDate,
			req.TimeToFirstResponseHours, req.TimeToResolutionHours,
			req.CustomerSatisfactionScore, req.NPSScoreChange, false,
			req.TeamConsensusScore, req.LessonsLearned,
			req.ActualCost, req.RevenueImpact,
			now, now,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record outcome", "details": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "Outcome recorded successfully",
			"data": gin.H{
				"id":          outcomeID,
				"decision_id": decisionID,
			},
		})
	} else {
		// Update existing outcome
		_, err = h.db.ExecContext(c, `
			UPDATE outcome_tracking SET
				first_response_at = $1,
				resolution_at = $2,
				time_to_first_response_hours = $3,
				time_to_resolution_hours = $4,
				customer_satisfaction_score = $5,
				nps_change = $6,
				team_consensus_score = $7,
				lessons_learned = $8,
				actual_financial_impact = $9,
				updated_at = $10
			WHERE id = $11
		`,
			req.ResponseSentDate, req.ResponseSentDate,
			req.TimeToFirstResponseHours, req.TimeToResolutionHours,
			req.CustomerSatisfactionScore, req.NPSScoreChange,
			req.TeamConsensusScore, req.LessonsLearned,
			req.RevenueImpact, now, existingID,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update outcome", "details": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Outcome updated successfully",
			"data": gin.H{
				"id":          existingID,
				"decision_id": decisionID,
			},
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

	// Get outcome - Use specific fields to avoid issues with nullable columns
	type OutcomeResponse struct {
		ID                        uuid.UUID  `json:"id" db:"id"`
		DecisionID                uuid.UUID  `json:"decision_id" db:"decision_id"`
		DecisionCreatedAt         time.Time  `json:"decision_created_at" db:"decision_created_at"`
		FirstResponseAt           *time.Time `json:"first_response_at" db:"first_response_at"`
		ResolutionAt              *time.Time `json:"resolution_at" db:"resolution_at"`
		TimeToFirstResponseHours  *float64   `json:"time_to_first_response_hours" db:"time_to_first_response_hours"`
		TimeToResolutionHours     *float64   `json:"time_to_resolution_hours" db:"time_to_resolution_hours"`
		CustomerSatisfactionScore *int       `json:"customer_satisfaction_score" db:"customer_satisfaction_score"`
		NPSChange                 *int       `json:"nps_change" db:"nps_change"`
		TeamConsensusScore        *float64   `json:"team_consensus_score" db:"team_consensus_score"`
		LessonsLearned            *string    `json:"lessons_learned" db:"lessons_learned"`
		EstimatedFinancialImpact  *float64   `json:"estimated_financial_impact" db:"estimated_financial_impact"`
		ActualFinancialImpact     *float64   `json:"actual_financial_impact" db:"actual_financial_impact"`
		CreatedAt                 time.Time  `json:"created_at" db:"created_at"`
		UpdatedAt                 time.Time  `json:"updated_at" db:"updated_at"`
	}

	var outcome OutcomeResponse
	err = h.db.GetContext(c, &outcome, `
		SELECT id, decision_id, decision_created_at, first_response_at, resolution_at,
		       time_to_first_response_hours, time_to_resolution_hours,
		       customer_satisfaction_score, nps_change, team_consensus_score,
		       lessons_learned, estimated_financial_impact, actual_financial_impact,
		       created_at, updated_at
		FROM outcome_tracking
		WHERE decision_id = $1
	`, decisionID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No outcome recorded yet"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": outcome,
	})
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
