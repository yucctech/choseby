package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"choseby-backend/internal/ai"
	"choseby-backend/internal/auth"
	"choseby-backend/internal/database"
	"choseby-backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// ResponseDraftHandler handles AI-generated customer response draft operations
type ResponseDraftHandler struct {
	db          *database.DB
	authService *auth.AuthService
	aiService   *ai.AIService
}

func NewResponseDraftHandler(db *database.DB, authService *auth.AuthService, apiKey string) *ResponseDraftHandler {
	return &ResponseDraftHandler{
		db:          db,
		authService: authService,
		aiService:   ai.NewAIService(apiKey, db),
	}
}

// GenerateResponseDraft generates AI-powered customer response draft
func (h *ResponseDraftHandler) GenerateResponseDraft(c *gin.Context) {
	decisionID := c.Param("id")
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req models.GenerateResponseDraftRequest
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

	// Get evaluation results to extract team consensus and recommended option
	var evalResults models.EvaluationResults
	err = h.getEvaluationResults(c, decisionID, decision.TeamID, &evalResults)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Team evaluations required before generating response draft",
			"details": "Please ensure team members have completed their evaluations",
		})
		return
	}

	// Parse selected option ID
	selectedOptionID, err := uuid.Parse(req.DecisionOutcome.SelectedOptionID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid option ID format"})
		return
	}

	// Get selected option details
	var selectedOption models.ResponseOption
	err = h.db.GetContext(c, &selectedOption, `
		SELECT * FROM response_options WHERE id = $1 AND decision_id = $2
	`, selectedOptionID, decisionID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Selected option not found"})
		return
	}

	// Find option score for consensus and weighted score
	var optionScore *models.OptionScore
	for _, score := range evalResults.OptionScores {
		if score.OptionID == selectedOptionID {
			optionScore = &score
			break
		}
	}

	if optionScore == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No evaluation data found for selected option"})
		return
	}

	// Determine next version number
	var latestVersion int
	err = h.db.GetContext(c, &latestVersion, `
		SELECT COALESCE(MAX(version), 0) FROM response_drafts WHERE decision_id = $1
	`, decisionID)
	if err != nil {
		latestVersion = 0
	}
	nextVersion := latestVersion + 1

	// Build AI request
	draftRequest := ai.ResponseDraftRequest{
		DecisionOutcome: ai.DecisionOutcome{
			SelectedOptionTitle: selectedOption.Title,
			Reasoning:           req.DecisionOutcome.Reasoning,
			TeamConsensus:       evalResults.TeamConsensus,
			WeightedScore:       optionScore.WeightedScore,
		},
		CustomerContext: decision,
		CommunicationPreferences: ai.CommunicationPreferences{
			Tone:    req.CommunicationPreferences.Tone,
			Channel: req.CommunicationPreferences.Channel,
			Urgency: req.CommunicationPreferences.Urgency,
		},
		SelectedOption: &selectedOption,
	}

	// Generate draft using AI service
	aiDraft, err := h.aiService.GenerateResponseDraft(c.Request.Context(), draftRequest)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "AI draft generation failed",
			"details": err.Error(),
		})
		return
	}

	// Build generation metadata
	metadata := map[string]interface{}{
		"ai_model":                  "deepseek-chat",
		"team_consensus":            evalResults.TeamConsensus,
		"option_weighted_score":     optionScore.WeightedScore,
		"option_conflict_level":     optionScore.ConflictLevel,
		"participation_rate":        evalResults.ParticipationRate,
		"communication_preferences": req.CommunicationPreferences,
		"regenerated_from_version":  req.RegenerateFromVersion,
	}
	metadataJSON, _ := json.Marshal(metadata)
	metadataStr := string(metadataJSON)

	// Save draft to database
	draft := models.ResponseDraft{
		ID:                          uuid.New(),
		DecisionID:                  uuid.MustParse(decisionID),
		DraftContent:                aiDraft.DraftContent,
		Tone:                        aiDraft.Tone,
		KeyPoints:                   aiDraft.KeyPoints,
		EstimatedSatisfactionImpact: &aiDraft.EstimatedSatisfactionImpact,
		FollowUpRecommendations:     aiDraft.FollowUpRecommendations,
		Version:                     nextVersion,
		CreatedBy:                   userID.(uuid.UUID),
		CreatedAt:                   time.Now(),
		UpdatedAt:                   time.Now(),
		GenerationMetadata:          &metadataStr,
		BasedOnOptionID:             &selectedOptionID,
		TeamConsensusScore:          &evalResults.TeamConsensus,
	}

	_, err = h.db.NamedExecContext(c, `
		INSERT INTO response_drafts (
			id, decision_id, draft_content, tone, key_points,
			estimated_satisfaction_impact, follow_up_recommendations,
			version, created_by, created_at, updated_at,
			generation_metadata, based_on_option_id, team_consensus_score
		) VALUES (
			:id, :decision_id, :draft_content, :tone, :key_points,
			:estimated_satisfaction_impact, :follow_up_recommendations,
			:version, :created_by, :created_at, :updated_at,
			:generation_metadata, :based_on_option_id, :team_consensus_score
		)
	`, draft)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to save draft",
			"details": err.Error(),
		})
		return
	}

	// Return draft with metadata
	response := gin.H{
		"id":                            draft.ID,
		"decision_id":                   draft.DecisionID,
		"draft_content":                 draft.DraftContent,
		"tone":                          draft.Tone,
		"key_points":                    draft.KeyPoints,
		"estimated_satisfaction_impact": draft.EstimatedSatisfactionImpact,
		"follow_up_recommendations":     draft.FollowUpRecommendations,
		"version":                       draft.Version,
		"team_consensus_score":          draft.TeamConsensusScore,
		"created_at":                    draft.CreatedAt,
	}

	c.JSON(http.StatusCreated, response)
}

// GetDrafts retrieves all drafts for a decision
func (h *ResponseDraftHandler) GetDrafts(c *gin.Context) {
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

	// Get all drafts for this decision
	var drafts []models.ResponseDraft
	err = h.db.SelectContext(c, &drafts, `
		SELECT * FROM response_drafts
		WHERE decision_id = $1
		ORDER BY version DESC
	`, decisionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve drafts"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"drafts": drafts,
		"total":  len(drafts),
	})
}

// getEvaluationResults is a helper to fetch evaluation results
func (h *ResponseDraftHandler) getEvaluationResults(c *gin.Context, decisionID string, teamID uuid.UUID, results *models.EvaluationResults) error {
	// Get all team members for participation calculation
	var totalMembers int
	err := h.db.GetContext(c, &totalMembers, `
		SELECT COUNT(*) FROM team_members WHERE team_id = $1 AND is_active = true
	`, teamID)
	if err != nil {
		return fmt.Errorf("failed to count team members: %w", err)
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
		return fmt.Errorf("failed to calculate option scores: %w", err)
	}

	if len(optionAnalyses) == 0 {
		return fmt.Errorf("no evaluation data found")
	}

	// Convert to OptionScore models
	var optionScores []models.OptionScore
	for _, analysis := range optionAnalyses {
		consensus := 1.0
		if analysis.ScoreVariance > 0 {
			consensus = max(0, 1.0-(analysis.ScoreVariance/10.0))
		}

		conflictLevel := "none"
		if analysis.ScoreVariance > 4.0 {
			conflictLevel = "high"
		} else if analysis.ScoreVariance > 2.0 {
			conflictLevel = "medium"
		} else if analysis.ScoreVariance > 1.0 {
			conflictLevel = "low"
		}

		optionScores = append(optionScores, models.OptionScore{
			OptionID:      analysis.OptionID,
			OptionTitle:   analysis.OptionTitle,
			AverageScore:  analysis.AverageScore,
			WeightedScore: analysis.WeightedScore,
			Evaluators:    analysis.Evaluators,
			Consensus:     consensus,
			ConflictLevel: conflictLevel,
		})
	}

	// Calculate team consensus
	teamConsensus := 0.0
	if len(optionScores) > 0 {
		totalConsensus := 0.0
		for _, score := range optionScores {
			totalConsensus += score.Consensus
		}
		teamConsensus = totalConsensus / float64(len(optionScores))
	}

	// Get completed evaluators count
	var completedCount int
	err = h.db.GetContext(c, &completedCount, `
		SELECT COUNT(DISTINCT evaluator_id)
		FROM evaluations
		WHERE decision_id = $1
	`, decisionID)
	if err != nil {
		completedCount = 0
	}

	participationRate := float64(completedCount) / float64(totalMembers)

	results.OptionScores = optionScores
	results.TeamConsensus = teamConsensus
	results.ParticipationRate = participationRate

	return nil
}

func max(a, b float64) float64 {
	if a > b {
		return a
	}
	return b
}
