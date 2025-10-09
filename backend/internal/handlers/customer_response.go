package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"choseby-backend/internal/auth"
	"choseby-backend/internal/database"
	"choseby-backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// DecisionsHandler handles customer decision operations
type DecisionsHandler struct {
	db          *database.DB
	authService *auth.Service
}

func NewDecisionsHandler(db *database.DB, authService *auth.Service) *DecisionsHandler {
	return &DecisionsHandler{
		db:          db,
		authService: authService,
	}
}

// GetTeamDecisions retrieves all decisions for the authenticated user's team
func (h *DecisionsHandler) GetTeamDecisions(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get query parameters for filtering
	status := c.Query("status")
	urgency := c.Query("urgency")
	limit := c.DefaultQuery("limit", "20")
	offset := c.DefaultQuery("offset", "0")

	limitInt, _ := strconv.Atoi(limit)
	offsetInt, _ := strconv.Atoi(offset)

	// Get user's team ID
	var teamID uuid.UUID
	err := h.db.GetContext(c, &teamID, `
		SELECT team_id FROM team_members WHERE id = $1 AND is_active = true
	`, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		return
	}

	// Build query with filters
	query := `
		SELECT id, customer_name, customer_tier, title, status, urgency_level, created_at
		FROM customer_decisions
		WHERE team_id = $1
	`
	args := []interface{}{teamID}
	argIndex := 2

	if status != "" {
		query += fmt.Sprintf(" AND status = $%d", argIndex)
		args = append(args, status)
		argIndex++
	}

	if urgency != "" {
		urgencyInt, _ := strconv.Atoi(urgency)
		query += fmt.Sprintf(" AND urgency_level = $%d", argIndex)
		args = append(args, urgencyInt)
		argIndex++
	}

	query += " ORDER BY created_at DESC"
	query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", argIndex, argIndex+1)
	args = append(args, limitInt, offsetInt)

	type DecisionSummary struct {
		ID           uuid.UUID `json:"id" db:"id"`
		CustomerName string    `json:"customer_name" db:"customer_name"`
		CustomerTier string    `json:"customer_tier" db:"customer_tier"`
		Title        string    `json:"title" db:"title"`
		Status       string    `json:"status" db:"status"`
		UrgencyLevel int       `json:"urgency_level" db:"urgency_level"`
		CreatedAt    time.Time `json:"created_at" db:"created_at"`
	}

	var decisions []DecisionSummary
	err = h.db.SelectContext(c, &decisions, query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch decisions"})
		return
	}

	// Get total count for pagination
	countQuery := `SELECT COUNT(*) FROM customer_decisions WHERE team_id = $1`
	countArgs := []interface{}{teamID}
	if status != "" {
		countQuery += " AND status = $2"
		countArgs = append(countArgs, status)
	}

	var total int
	err = h.db.GetContext(c, &total, countQuery, countArgs...)
	if err != nil {
		total = 0
	}

	c.JSON(http.StatusOK, gin.H{
		"decisions": decisions,
		"total":     total,
		"limit":     limitInt,
		"offset":    offsetInt,
	})
}

// CreateDecision creates a new customer response decision
func (h *DecisionsHandler) CreateDecision(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req models.CreateDecisionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format", "details": err.Error()})
		return
	}

	// Get user's team ID
	var teamID uuid.UUID
	err := h.db.GetContext(c, &teamID, `
		SELECT team_id FROM team_members WHERE id = $1 AND is_active = true
	`, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		return
	}

	// Set default values for enhanced customer context if not provided
	customerTierDetailed := req.CustomerTierDetailed
	if customerTierDetailed == "" {
		customerTierDetailed = "standard"
	}
	urgencyLevelDetailed := req.UrgencyLevelDetailed
	if urgencyLevelDetailed == "" {
		urgencyLevelDetailed = models.PriorityMedium
	}
	customerImpactScope := req.CustomerImpactScope
	if customerImpactScope == "" {
		customerImpactScope = "single_user"
	}

	// Create decision
	decision := models.CustomerDecision{
		ID:                         uuid.New(),
		TeamID:                     teamID,
		CreatedBy:                  userID.(uuid.UUID),
		CustomerName:               req.CustomerName,
		CustomerEmail:              req.CustomerEmail,
		CustomerTier:               req.CustomerTier,
		CustomerValue:              req.CustomerValue,
		RelationshipDurationMonths: req.RelationshipDurationMonths,
		// Enhanced Customer Context (Week 1 Migration)
		CustomerTierDetailed:   customerTierDetailed,
		UrgencyLevelDetailed:   urgencyLevelDetailed,
		CustomerImpactScope:    customerImpactScope,
		RelationshipHistory:    req.RelationshipHistory,
		PreviousIssuesCount:    req.PreviousIssuesCount,
		LastInteractionDate:    req.LastInteractionDate,
		NPSScore:               req.NPSScore,
		Title:                  req.Title,
		Description:            req.Description,
		DecisionType:           req.DecisionType,
		UrgencyLevel:           req.UrgencyLevel,
		FinancialImpact:        req.FinancialImpact,
		Status:                 "created",
		CurrentPhase:           1,
		ExpectedResolutionDate: req.ExpectedResolutionDate,
		CreatedAt:              time.Now(),
		UpdatedAt:              time.Now(),
	}

	// Insert decision into database
	_, err = h.db.NamedExecContext(c, `
		INSERT INTO customer_decisions (
			id, team_id, created_by, customer_name, customer_email, customer_tier,
			customer_value, relationship_duration_months,
			customer_tier_detailed, urgency_level_detailed, customer_impact_scope,
			relationship_history, previous_issues_count, last_interaction_date, nps_score,
			title, description, decision_type, urgency_level, financial_impact,
			status, current_phase, expected_resolution_date, created_at, updated_at
		) VALUES (
			:id, :team_id, :created_by, :customer_name, :customer_email, :customer_tier,
			:customer_value, :relationship_duration_months,
			:customer_tier_detailed, :urgency_level_detailed, :customer_impact_scope,
			:relationship_history, :previous_issues_count, :last_interaction_date, :nps_score,
			:title, :description, :decision_type, :urgency_level, :financial_impact,
			:status, :current_phase, :expected_resolution_date, :created_at, :updated_at
		)
	`, decision)
	if err != nil {
		_ = c.Error(err) // Log error to Gin context
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create decision", "details": err.Error()})
		return
	}

	// Return simplified response
	response := gin.H{
		"id":            decision.ID,
		"team_id":       decision.TeamID,
		"customer_name": decision.CustomerName,
		"customer_tier": decision.CustomerTier,
		"title":         decision.Title,
		"status":        decision.Status,
		"current_phase": decision.CurrentPhase,
		"urgency_level": decision.UrgencyLevel,
		"created_at":    decision.CreatedAt,
	}

	c.JSON(http.StatusCreated, response)
}

// GetDecision retrieves detailed decision information
func (h *DecisionsHandler) GetDecision(c *gin.Context) {
	decisionID := c.Param("id")
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get decision with team verification
	var decision models.CustomerDecision
	err := h.db.GetContext(c, &decision, `
		SELECT cd.* FROM customer_decisions cd
		JOIN team_members tm ON cd.team_id = tm.team_id
		WHERE cd.id = $1 AND tm.id = $2 AND tm.is_active = true
	`, decisionID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Decision not found"})
		return
	}

	// Get criteria
	var criteria []models.DecisionCriterion
	err = h.db.SelectContext(c, &criteria, `
		SELECT * FROM decision_criteria WHERE decision_id = $1 ORDER BY created_at
	`, decisionID)
	if err != nil {
		criteria = []models.DecisionCriterion{}
	}

	// Get options
	var options []models.ResponseOption
	err = h.db.SelectContext(c, &options, `
		SELECT * FROM response_options WHERE decision_id = $1 ORDER BY created_at
	`, decisionID)
	if err != nil {
		options = []models.ResponseOption{}
	}

	// Get evaluations (anonymized)
	type AnonymousEvaluation struct {
		OptionID      uuid.UUID `json:"option_id" db:"option_id"`
		CriteriaID    uuid.UUID `json:"criteria_id" db:"criteria_id"`
		Score         int       `json:"score" db:"score"`
		EvaluatorRole string    `json:"evaluator_role" db:"evaluator_role"`
	}

	var evaluations []AnonymousEvaluation
	err = h.db.SelectContext(c, &evaluations, `
		SELECT e.option_id, e.criteria_id, e.score, tm.role as evaluator_role
		FROM evaluations e
		JOIN team_members tm ON e.evaluator_id = tm.id
		WHERE e.decision_id = $1
	`, decisionID)
	if err != nil {
		evaluations = []AnonymousEvaluation{}
	}

	response := gin.H{
		"decision":    decision,
		"criteria":    criteria,
		"options":     options,
		"evaluations": evaluations,
	}

	c.JSON(http.StatusOK, response)
}

// UpdateCriteria updates decision criteria
func (h *DecisionsHandler) UpdateCriteria(c *gin.Context) {
	decisionID := c.Param("id")
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	type CriteriaRequest struct {
		Criteria []struct {
			Name        string  `json:"name" validate:"required"`
			Description *string `json:"description"`
			Weight      float64 `json:"weight" validate:"min=0.1,max=5.0"`
		} `json:"criteria" validate:"required,dive"`
	}

	var req CriteriaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
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
		c.JSON(http.StatusNotFound, gin.H{"error": "Decision not found"})
		return
	}

	// Delete existing criteria
	_, err = h.db.ExecContext(c, `DELETE FROM decision_criteria WHERE decision_id = $1`, decisionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update criteria", "details": err.Error()})
		return
	}

	// Insert new criteria
	var criteria []models.DecisionCriterion
	for _, cr := range req.Criteria {
		criterion := models.DecisionCriterion{
			ID:          uuid.New(),
			DecisionID:  uuid.MustParse(decisionID),
			Name:        cr.Name,
			Description: cr.Description,
			Weight:      cr.Weight,
			CreatedBy:   userID.(uuid.UUID),
			CreatedAt:   time.Now(),
		}

		_, err = h.db.NamedExecContext(c, `
			INSERT INTO decision_criteria (id, decision_id, name, description, weight, created_by, created_at)
			VALUES (:id, :decision_id, :name, :description, :weight, :created_by, :created_at)
		`, criterion)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create criterion", "details": err.Error()})
			return
		}

		criteria = append(criteria, criterion)
	}

	c.JSON(http.StatusOK, gin.H{"criteria": criteria})
}

// UpdateOptions updates response options
func (h *DecisionsHandler) UpdateOptions(c *gin.Context) {
	decisionID := c.Param("id")
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	type OptionsRequest struct {
		Options []struct {
			Title                string  `json:"title" validate:"required"`
			Description          string  `json:"description" validate:"required"`
			FinancialCost        float64 `json:"financial_cost"`
			ImplementationEffort string  `json:"implementation_effort"`
			RiskLevel            string  `json:"risk_level"`
		} `json:"options" validate:"required,dive"`
	}

	var req OptionsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
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
		c.JSON(http.StatusNotFound, gin.H{"error": "Decision not found"})
		return
	}

	// Delete existing options and related evaluations
	_, err = h.db.ExecContext(c, `DELETE FROM response_options WHERE decision_id = $1`, decisionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update options"})
		return
	}

	// Insert new options
	var options []models.ResponseOption
	for _, opt := range req.Options {
		userUUID := userID.(uuid.UUID)
		option := models.ResponseOption{
			ID:                   uuid.New(),
			DecisionID:           uuid.MustParse(decisionID),
			Title:                opt.Title,
			Description:          opt.Description,
			FinancialCost:        opt.FinancialCost,
			ImplementationEffort: opt.ImplementationEffort,
			RiskLevel:            opt.RiskLevel,
			CreatedBy:            &userUUID,
			CreatedAt:            time.Now(),
		}

		_, err = h.db.NamedExecContext(c, `
			INSERT INTO response_options (id, decision_id, title, description, financial_cost, implementation_effort, risk_level, created_by, created_at)
			VALUES (:id, :decision_id, :title, :description, :financial_cost, :implementation_effort, :risk_level, :created_by, :created_at)
		`, option)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create option"})
			return
		}

		options = append(options, option)
	}

	c.JSON(http.StatusOK, gin.H{"options": options})
}

// Placeholder methods for interface compatibility
func (h *DecisionsHandler) UpdateDecision(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Not implemented yet"})
}

func (h *DecisionsHandler) DeleteDecision(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Not implemented yet"})
}

func (h *DecisionsHandler) GetCriteria(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Not implemented yet"})
}

func (h *DecisionsHandler) GetOptions(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Not implemented yet"})
}
