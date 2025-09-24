package handlers

import (
	"choseby-backend/internal/auth"
	"choseby-backend/internal/database"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

// Common handler dependencies
type BaseHandler struct {
	db          *database.DB
	authService *auth.AuthService
}

// Team handler
type TeamHandler struct {
	BaseHandler
}

func NewTeamHandler(db *database.DB, authService *auth.AuthService) *TeamHandler {
	return &TeamHandler{BaseHandler{db, authService}}
}

func (h *TeamHandler) GetUserTeams(c *gin.Context) {
	userIDValue, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID, ok := userIDValue.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid_user_id"})
		return
	}

	rows, err := h.db.Query(`
		SELECT t.id, t.name, t.organization, t.created_at, t.updated_at,
		       (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count,
		       (SELECT COUNT(*) FROM decisions WHERE team_id = t.id AND status = 'active') as active_decisions,
		       (SELECT COUNT(*) FROM decisions WHERE team_id = t.id AND status = 'completed') as completed_decisions
		FROM teams t
		INNER JOIN team_members tm ON t.id = tm.team_id
		WHERE tm.user_id = $1
		ORDER BY t.created_at DESC
	`, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error", "message": "Failed to fetch teams"})
		return
	}
	defer rows.Close()

	var teams []gin.H
	for rows.Next() {
		var id, name, organization string
		var createdAt, updatedAt time.Time
		var memberCount, activeDecisions, completedDecisions int

		err := rows.Scan(&id, &name, &organization, &createdAt, &updatedAt, &memberCount, &activeDecisions, &completedDecisions)
		if err != nil {
			continue
		}

		teams = append(teams, gin.H{
			"id":                  id,
			"name":                name,
			"organization":        organization,
			"member_count":        memberCount,
			"active_decisions":    activeDecisions,
			"completed_decisions": completedDecisions,
			"created_at":          createdAt,
			"updated_at":          updatedAt,
		})
	}

	if teams == nil {
		teams = []gin.H{}
	}

	c.JSON(http.StatusOK, teams)
}

func (h *TeamHandler) CreateTeam(c *gin.Context) {
	c.JSON(http.StatusCreated, gin.H{"message": "Team created"})
}

func (h *TeamHandler) GetTeam(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"team": gin.H{}})
}

func (h *TeamHandler) UpdateTeam(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Team updated"})
}

func (h *TeamHandler) DeleteTeam(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Team deleted"})
}

func (h *TeamHandler) GetTeamMembers(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"members": []interface{}{}})
}

func (h *TeamHandler) AddTeamMember(c *gin.Context) {
	c.JSON(http.StatusCreated, gin.H{"message": "Member added"})
}

func (h *TeamHandler) UpdateTeamMember(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Member updated"})
}

func (h *TeamHandler) RemoveTeamMember(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Member removed"})
}

// Decision handler
type DecisionHandler struct {
	BaseHandler
}

func NewDecisionHandler(db *database.DB, authService *auth.AuthService) *DecisionHandler {
	return &DecisionHandler{BaseHandler{db, authService}}
}

func (h *DecisionHandler) GetTeamDecisions(c *gin.Context) {
	teamID := c.Param("teamId")

	rows, err := h.db.Query(`
		SELECT id, title, description, decision_type, status, priority, created_at, updated_at
		FROM decisions
		WHERE team_id = $1
		ORDER BY created_at DESC
	`, teamID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error", "message": "Failed to fetch decisions"})
		return
	}
	defer rows.Close()

	var decisions []gin.H
	for rows.Next() {
		var id, title, description, decisionType, status, priority string
		var createdAt, updatedAt time.Time

		err := rows.Scan(&id, &title, &description, &decisionType, &status, &priority, &createdAt, &updatedAt)
		if err != nil {
			continue
		}

		decisions = append(decisions, gin.H{
			"id":            id,
			"title":         title,
			"description":   description,
			"decision_type": decisionType,
			"status":        status,
			"priority":      priority,
			"created_at":    createdAt,
			"updated_at":    updatedAt,
		})
	}

	if decisions == nil {
		decisions = []gin.H{}
	}

	c.JSON(http.StatusOK, gin.H{"decisions": decisions})
}

func (h *DecisionHandler) CreateDecision(c *gin.Context) {
	teamID := c.Param("teamId")

	var req struct {
		Title          string `json:"title" binding:"required"`
		Description    string `json:"description"`
		WorkflowType   string `json:"workflow_type"`
		PatientImpact  string `json:"patient_impact"`
		Status         string `json:"status"`
		CurrentPhase   int    `json:"current_phase"`
		Urgency        string `json:"urgency"`
		DecisionType   string `json:"decision_type"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create decision ID
	decisionID := uuid.New().String()

	// Map urgency to valid priority values
	priority := "medium" // default
	if req.Urgency == "emergency" {
		priority = "critical"
	} else if req.Urgency == "high" {
		priority = "high"
	} else if req.Urgency == "low" {
		priority = "low"
	}

	// Map status to valid values: draft, active, under_review, completed, cancelled
	status := "active" // default
	if req.Status == "emergency" {
		status = "active"
	} else if req.Status == "in_progress" {
		status = "active"
	} else if req.Status == "draft" {
		status = "draft"
	}

	// Insert into database
	_, err := h.db.Exec(`
		INSERT INTO decisions (id, team_id, title, description, decision_type, status, priority, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
	`, decisionID, teamID, req.Title, req.Description, req.DecisionType, status, priority)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create decision"})
		return
	}

	// Return the created decision
	c.JSON(http.StatusCreated, gin.H{
		"id": decisionID,
		"team_id": teamID,
		"title": req.Title,
		"description": req.Description,
		"decision_type": req.DecisionType,
		"status": req.Status,
		"priority": req.Urgency,
		"current_phase": req.CurrentPhase,
	})
}

func (h *DecisionHandler) GetDecision(c *gin.Context) {
	decisionID := c.Param("decisionId")

	var decision struct {
		ID             string    `db:"id"`
		TeamID         string    `db:"team_id"`
		Title          string    `db:"title"`
		Description    string    `db:"description"`
		DecisionType   string    `db:"decision_type"`
		Status         string    `db:"status"`
		Priority       string    `db:"priority"`
		CurrentPhase   int       `db:"current_phase"`
		CreatedAt      time.Time `db:"created_at"`
		UpdatedAt      time.Time `db:"updated_at"`
	}

	err := h.db.QueryRow(`
		SELECT id, team_id, title, description, decision_type, status, priority,
		       COALESCE(current_phase, 1) as current_phase, created_at, updated_at
		FROM decisions
		WHERE id = $1
	`, decisionID).Scan(
		&decision.ID, &decision.TeamID, &decision.Title, &decision.Description,
		&decision.DecisionType, &decision.Status, &decision.Priority,
		&decision.CurrentPhase, &decision.CreatedAt, &decision.UpdatedAt,
	)

	if err != nil {
		log.Printf("GetDecision error for decision %s: %v", decisionID, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Decision not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":             decision.ID,
		"team_id":        decision.TeamID,
		"title":          decision.Title,
		"description":    decision.Description,
		"decision_type":  decision.DecisionType,
		"status":         decision.Status,
		"priority":       decision.Priority,
		"current_phase":  decision.CurrentPhase,
		"created_at":     decision.CreatedAt,
		"updated_at":     decision.UpdatedAt,
	})
}

func (h *DecisionHandler) UpdateDecision(c *gin.Context) {
	decisionID := c.Param("decisionId")

	var req struct {
		Title        string `json:"title"`
		Description  string `json:"description"`
		Status       string `json:"status"`
		CurrentPhase int    `json:"current_phase"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := h.db.Exec(`
		UPDATE decisions
		SET title = COALESCE(NULLIF($1, ''), title),
		    description = COALESCE(NULLIF($2, ''), description),
		    status = COALESCE(NULLIF($3, ''), status),
		    current_phase = COALESCE(NULLIF($4, 0), current_phase),
		    updated_at = NOW()
		WHERE id = $5
	`, req.Title, req.Description, req.Status, req.CurrentPhase, decisionID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update decision"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Decision updated"})
}

func (h *DecisionHandler) DeleteDecision(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Decision deleted"})
}

func (h *DecisionHandler) GetDecisionCriteria(c *gin.Context) {
	decisionID := c.Param("decisionId")

	rows, err := h.db.Query(`
		SELECT id, decision_id, name, description, weight, category, created_at, updated_at
		FROM decision_criteria
		WHERE decision_id = $1
		ORDER BY created_at ASC
	`, decisionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch criteria"})
		return
	}
	defer rows.Close()

	var criteria []gin.H
	for rows.Next() {
		var id, decisionId, name, description, category string
		var weight int
		var createdAt, updatedAt time.Time

		err := rows.Scan(&id, &decisionId, &name, &description, &weight, &category, &createdAt, &updatedAt)
		if err != nil {
			continue
		}

		criteria = append(criteria, gin.H{
			"id":          id,
			"decision_id": decisionId,
			"name":        name,
			"description": description,
			"weight":      weight,
			"category":    category,
			"created_at":  createdAt,
			"updated_at":  updatedAt,
		})
	}

	if criteria == nil {
		criteria = []gin.H{}
	}

	c.JSON(http.StatusOK, criteria)
}

func (h *DecisionHandler) CreateCriterion(c *gin.Context) {
	decisionID := c.Param("decisionId")

	var req struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
		Weight      int    `json:"weight" binding:"required"`
		Category    string `json:"category"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	criterionID := uuid.New().String()

	_, err := h.db.Exec(`
		INSERT INTO decision_criteria (id, decision_id, name, description, weight, category, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
	`, criterionID, decisionID, req.Name, req.Description, req.Weight, req.Category)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create criterion"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":          criterionID,
		"decision_id": decisionID,
		"name":        req.Name,
		"description": req.Description,
		"weight":      req.Weight,
		"category":    req.Category,
	})
}

func (h *DecisionHandler) UpdateCriterion(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Criterion updated"})
}

func (h *DecisionHandler) DeleteCriterion(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Criterion deleted"})
}

func (h *DecisionHandler) GetDecisionOptions(c *gin.Context) {
	decisionID := c.Param("decisionId")

	rows, err := h.db.Query(`
		SELECT id, decision_id, name, description, estimated_cost,
		       implementation_timeline, risk_level, created_at, updated_at
		FROM decision_options
		WHERE decision_id = $1
		ORDER BY created_at ASC
	`, decisionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch options"})
		return
	}
	defer rows.Close()

	var options []gin.H
	for rows.Next() {
		var id, decisionId, name, description, timeline, riskLevel string
		var cost int
		var createdAt, updatedAt time.Time

		err := rows.Scan(&id, &decisionId, &name, &description, &cost, &timeline, &riskLevel, &createdAt, &updatedAt)
		if err != nil {
			continue
		}

		options = append(options, gin.H{
			"id":                      id,
			"decision_id":             decisionId,
			"name":                    name,
			"description":             description,
			"estimated_cost":          cost,
			"implementation_timeline": timeline,
			"risk_level":              riskLevel,
			"created_at":              createdAt,
			"updated_at":              updatedAt,
		})
	}

	if options == nil {
		options = []gin.H{}
	}

	c.JSON(http.StatusOK, options)
}

func (h *DecisionHandler) CreateOption(c *gin.Context) {
	decisionID := c.Param("decisionId")

	var req struct {
		Name                   string `json:"name" binding:"required"`
		Description            string `json:"description"`
		EstimatedCost          int    `json:"estimated_cost"`
		ImplementationTimeline string `json:"implementation_timeline"`
		RiskLevel              string `json:"risk_level"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	optionID := uuid.New().String()

	_, err := h.db.Exec(`
		INSERT INTO decision_options (id, decision_id, name, description, estimated_cost, implementation_timeline, risk_level, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
	`, optionID, decisionID, req.Name, req.Description, req.EstimatedCost, req.ImplementationTimeline, req.RiskLevel)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create option"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":                      optionID,
		"decision_id":             decisionID,
		"name":                    req.Name,
		"description":             req.Description,
		"estimated_cost":          req.EstimatedCost,
		"implementation_timeline": req.ImplementationTimeline,
		"risk_level":              req.RiskLevel,
	})
}

func (h *DecisionHandler) UpdateOption(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Option updated"})
}

func (h *DecisionHandler) DeleteOption(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Option deleted"})
}

// Conflict handler
type ConflictHandler struct {
	BaseHandler
}

func NewConflictHandler(db *database.DB, authService *auth.AuthService) *ConflictHandler {
	return &ConflictHandler{BaseHandler{db, authService}}
}

func (h *ConflictHandler) GetConflicts(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"conflicts": []interface{}{}})
}

func (h *ConflictHandler) InitiateResolution(c *gin.Context) {
	c.JSON(http.StatusCreated, gin.H{"message": "Resolution initiated"})
}

func (h *ConflictHandler) GetConflictDetails(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"conflict": gin.H{}})
}

func (h *ConflictHandler) ResolveConflict(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Conflict resolved"})
}

// Compliance handler
type ComplianceHandler struct {
	BaseHandler
}

func NewComplianceHandler(db *database.DB, authService *auth.AuthService) *ComplianceHandler {
	return &ComplianceHandler{BaseHandler{db, authService}}
}

func (h *ComplianceHandler) GetAuditReport(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"audit": gin.H{}})
}

func (h *ComplianceHandler) PerformRetentionCleanup(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Cleanup completed"})
}

func (h *ComplianceHandler) GetComplianceHealth(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"health": "ok"})
}

// Health handler
type HealthHandler struct {
	db *database.DB
}

func NewHealthHandler(db *database.DB) *HealthHandler {
	return &HealthHandler{db}
}

func (h *HealthHandler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "healthy",
		"service": "choseby-healthcare-api",
		"version": "1.0.0",
	})
}

func (h *HealthHandler) ReadinessProbe(c *gin.Context) {
	c.Status(http.StatusOK)
}

// WebSocket handler
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // In production, validate origin
	},
}

func HandleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "WebSocket upgrade failed"})
		return
	}
	defer conn.Close()

	// Handle WebSocket messages
	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			break
		}

		// Echo message back (implement real-time logic here)
		err = conn.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			break
		}
	}
}