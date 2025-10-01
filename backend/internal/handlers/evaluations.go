package handlers

import (
	"math"
	"net/http"
	"time"

	"choseby-backend/internal/auth"
	"choseby-backend/internal/database"
	"choseby-backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// EvaluationsHandler handles anonymous team evaluation operations
type EvaluationsHandler struct {
	db          *database.DB
	authService *auth.AuthService
}

func NewEvaluationsHandler(db *database.DB, authService *auth.AuthService) *EvaluationsHandler {
	return &EvaluationsHandler{
		db:          db,
		authService: authService,
	}
}

// SubmitEvaluation handles anonymous evaluation submission
func (h *EvaluationsHandler) SubmitEvaluation(c *gin.Context) {
	decisionID := c.Param("id")
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req models.EvaluationRequest
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

	// Check if user has already submitted an evaluation for this decision
	var existingCount int
	err = h.db.GetContext(c, &existingCount, `
		SELECT COUNT(*) FROM evaluations WHERE decision_id = $1 AND evaluator_id = $2
	`, decisionID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check existing evaluations"})
		return
	}

	// Delete existing evaluations for this user and decision (allow re-evaluation)
	if existingCount > 0 {
		_, err = h.db.ExecContext(c, `
			DELETE FROM evaluations WHERE decision_id = $1 AND evaluator_id = $2
		`, decisionID, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update existing evaluation"})
			return
		}
	}

	// Insert new evaluations
	evaluationCount := 0
	for _, eval := range req.Evaluations {
		evaluation := models.Evaluation{
			ID:               uuid.New(),
			DecisionID:       uuid.MustParse(decisionID),
			EvaluatorID:      userID.(uuid.UUID),
			OptionID:         eval.OptionID,
			CriteriaID:       eval.CriteriaID,
			Score:            eval.Score,
			Confidence:       eval.Confidence,
			AnonymousComment: eval.Comment,
			CreatedAt:        time.Now(),
		}

		_, err = h.db.NamedExecContext(c, `
			INSERT INTO evaluations (id, decision_id, evaluator_id, option_id, criteria_id, score, confidence, anonymous_comment, created_at)
			VALUES (:id, :decision_id, :evaluator_id, :option_id, :criteria_id, :score, :confidence, :anonymous_comment, :created_at)
		`, evaluation)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to submit evaluation", "details": err.Error()})
			return
		}

		evaluationCount++
	}

	c.JSON(http.StatusOK, gin.H{
		"message":           "Evaluation submitted successfully",
		"evaluations_count": evaluationCount,
	})
}

// GetResults calculates and returns evaluation results with consensus analysis
func (h *EvaluationsHandler) GetResults(c *gin.Context) {
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

	// Get all team members for participation calculation
	var totalMembers int
	err = h.db.GetContext(c, &totalMembers, `
		SELECT COUNT(*) FROM team_members WHERE team_id = $1 AND is_active = true
	`, teamID)
	if err != nil {
		totalMembers = 1 // fallback
	}

	// Get evaluators who have completed evaluations
	var completedEvaluators []string
	err = h.db.SelectContext(c, &completedEvaluators, `
		SELECT DISTINCT tm.role
		FROM evaluations e
		JOIN team_members tm ON e.evaluator_id = tm.id
		WHERE e.decision_id = $1
	`, decisionID)
	if err != nil {
		completedEvaluators = []string{}
	}

	// Get pending evaluators
	var pendingEvaluators []string
	err = h.db.SelectContext(c, &pendingEvaluators, `
		SELECT DISTINCT tm.role
		FROM team_members tm
		WHERE tm.team_id = $1 AND tm.is_active = true
		AND tm.id NOT IN (
			SELECT DISTINCT evaluator_id
			FROM evaluations
			WHERE decision_id = $2
		)
	`, teamID, decisionID)
	if err != nil {
		pendingEvaluators = []string{}
	}

	// Calculate option scores with weighted analysis
	type OptionAnalysis struct {
		OptionID      uuid.UUID `db:"option_id"`
		OptionTitle   string    `db:"option_title"`
		AverageScore  float64   `db:"avg_score"`
		WeightedScore float64   `db:"weighted_score"`
		Evaluators    int       `db:"evaluators"`
		ScoreVariance float64   `db:"score_variance"`
	}

	var optionAnalyses []OptionAnalysis
	err = h.db.SelectContext(c, &optionAnalyses, `
		SELECT
			ro.id as option_id,
			ro.title as option_title,
			COALESCE(AVG(e.score::float), 0) as avg_score,
			COALESCE(
				SUM(e.score::float * dc.weight) / NULLIF(SUM(dc.weight), 0),
				AVG(e.score::float)
			) as weighted_score,
			COUNT(DISTINCT e.evaluator_id) as evaluators,
			COALESCE(VARIANCE(e.score::float), 0) as score_variance
		FROM response_options ro
		LEFT JOIN evaluations e ON ro.id = e.option_id
		LEFT JOIN decision_criteria dc ON e.criteria_id = dc.id
		WHERE ro.decision_id = $1
		GROUP BY ro.id, ro.title
		ORDER BY weighted_score DESC
	`, decisionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to calculate results"})
		return
	}

	// Convert to response format with consensus analysis
	var optionScores []models.OptionScore
	var recommendedOptionID *uuid.UUID
	highestScore := 0.0

	for _, analysis := range optionAnalyses {
		// Calculate consensus level (inverse of variance, normalized)
		consensus := 1.0
		if analysis.ScoreVariance > 0 {
			consensus = math.Max(0, 1.0-(analysis.ScoreVariance/10.0))
		}

		// Determine conflict level based on variance
		conflictLevel := "none"
		if analysis.ScoreVariance > 4.0 {
			conflictLevel = "high"
		} else if analysis.ScoreVariance > 2.0 {
			conflictLevel = "medium"
		} else if analysis.ScoreVariance > 1.0 {
			conflictLevel = "low"
		}

		optionScore := models.OptionScore{
			OptionID:      analysis.OptionID,
			OptionTitle:   analysis.OptionTitle,
			AverageScore:  analysis.AverageScore,
			WeightedScore: analysis.WeightedScore,
			Evaluators:    analysis.Evaluators,
			Consensus:     consensus,
			ConflictLevel: conflictLevel,
		}

		optionScores = append(optionScores, optionScore)

		// Track highest scoring option for recommendation
		if analysis.WeightedScore > highestScore && analysis.Evaluators > 0 {
			highestScore = analysis.WeightedScore
			recommendedOptionID = &analysis.OptionID
		}
	}

	// Calculate overall team consensus
	participationRate := float64(len(completedEvaluators)) / float64(totalMembers)

	// Calculate team consensus based on score alignment across options
	teamConsensus := 0.0
	if len(optionScores) > 0 {
		totalConsensus := 0.0
		for _, score := range optionScores {
			totalConsensus += score.Consensus
		}
		teamConsensus = totalConsensus / float64(len(optionScores))
	}

	results := models.EvaluationResults{
		OptionScores:      optionScores,
		ParticipationRate: participationRate,
		CompletedBy:       completedEvaluators,
		PendingFrom:       pendingEvaluators,
		RecommendedOption: recommendedOptionID,
		TeamConsensus:     teamConsensus,
	}

	c.JSON(http.StatusOK, results)
}

// GetEvaluationStatus returns the current evaluation status for a decision
func (h *EvaluationsHandler) GetEvaluationStatus(c *gin.Context) {
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

	// Check if current user has submitted evaluation
	var userEvaluated bool
	err = h.db.GetContext(c, &userEvaluated, `
		SELECT EXISTS(SELECT 1 FROM evaluations WHERE decision_id = $1 AND evaluator_id = $2)
	`, decisionID, userID)
	if err != nil {
		userEvaluated = false
	}

	// Get total team members and completed evaluations
	var totalMembers int
	var completedEvaluations int

	err = h.db.GetContext(c, &totalMembers, `
		SELECT COUNT(*) FROM team_members WHERE team_id = $1 AND is_active = true
	`, teamID)
	if err != nil {
		totalMembers = 1
	}

	err = h.db.GetContext(c, &completedEvaluations, `
		SELECT COUNT(DISTINCT evaluator_id) FROM evaluations WHERE decision_id = $1
	`, decisionID)
	if err != nil {
		completedEvaluations = 0
	}

	participationRate := float64(completedEvaluations) / float64(totalMembers)

	status := gin.H{
		"user_evaluated":        userEvaluated,
		"total_members":         totalMembers,
		"completed_evaluations": completedEvaluations,
		"participation_rate":    participationRate,
		"can_view_results":      completedEvaluations > 0,
	}

	c.JSON(http.StatusOK, status)
}

// ExportEvaluations exports evaluation data (placeholder for future implementation)
func (h *EvaluationsHandler) ExportEvaluations(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Export functionality not implemented yet"})
}
