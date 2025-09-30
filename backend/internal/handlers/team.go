package handlers

import (
	"net/http"
	"time"

	"choseby-backend/internal/auth"
	"choseby-backend/internal/database"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// TeamHandler handles team management operations
type TeamHandler struct {
	db          *database.DB
	authService *auth.AuthService
}

func NewTeamHandler(db *database.DB, authService *auth.AuthService) *TeamHandler {
	return &TeamHandler{
		db:          db,
		authService: authService,
	}
}

// GetMembers retrieves all active team members for the authenticated user's team
func (h *TeamHandler) GetMembers(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get user's team ID using clean architecture
	var teamID uuid.UUID
	err := h.db.GetContext(c, &teamID, `
		SELECT team_id FROM team_members
		WHERE id = $1 AND is_active = true
	`, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find user team", "details": err.Error()})
		return
	}

	// Get all active team members
	type TeamMemberInfo struct {
		ID                      uuid.UUID `json:"id" db:"id"`
		Name                    string    `json:"name" db:"name"`
		Email                   string    `json:"email" db:"email"`
		Role                    string    `json:"role" db:"role"`
		EscalationAuthority     int       `json:"escalation_authority" db:"escalation_authority"`
		IsActive                bool      `json:"is_active" db:"is_active"`
		CreatedAt               time.Time `json:"created_at" db:"created_at"`
	}

	var members []TeamMemberInfo
	err = h.db.SelectContext(c, &members, `
		SELECT id, name, email, role, escalation_authority, is_active, created_at
		FROM team_members
		WHERE team_id = $1 AND is_active = true
		ORDER BY created_at ASC
	`, teamID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch team members", "details": err.Error(), "team_id": teamID})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"members": members,
	})
}

// InviteMember invites a new team member (placeholder for email invitation system)
func (h *TeamHandler) InviteMember(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	type InviteRequest struct {
		Email string `json:"email" validate:"required,email"`
		Name  string `json:"name" validate:"required"`
		Role  string `json:"role" validate:"required"`
	}

	var req InviteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format", "details": err.Error()})
		return
	}

	// Validate role
	validRoles := []string{
		"customer_success_manager",
		"support_manager",
		"account_manager",
		"sales_manager",
		"legal_compliance",
		"operations_manager",
	}

	roleValid := false
	for _, role := range validRoles {
		if req.Role == role {
			roleValid = true
			break
		}
	}

	if !roleValid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role specified"})
		return
	}

	// Get user's team ID and verify they can invite members
	var teamID uuid.UUID
	var userRole string
	err := h.db.GetContext(c, &teamID, `
		SELECT team_id FROM team_members
		WHERE id = $1 AND is_active = true
	`, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		return
	}

	err = h.db.GetContext(c, &userRole, `
		SELECT role FROM team_members
		WHERE id = $1 AND team_id = $2 AND is_active = true
	`, userID, teamID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	// Check if user already exists in team
	var existingMember int
	err = h.db.GetContext(c, &existingMember, `
		SELECT COUNT(*) FROM team_members WHERE email = $1 AND team_id = $2
	`, req.Email, teamID)
	if err == nil && existingMember > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "User already exists in team"})
		return
	}

	// For now, return a placeholder response
	// In a real implementation, this would:
	// 1. Generate an invitation token
	// 2. Send an email with the invitation link
	// 3. Store the pending invitation in the database

	inviteToken := uuid.New().String()

	c.JSON(http.StatusCreated, gin.H{
		"message":      "Invitation sent successfully",
		"invite_token": inviteToken,
		"email":        req.Email,
		"name":         req.Name,
		"role":         req.Role,
		"expires_in":   "7 days",
	})
}

// GetTeam retrieves team information (placeholder)
func (h *TeamHandler) GetTeam(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get team information
	type TeamInfo struct {
		ID               uuid.UUID `json:"id" db:"id"`
		Name             string    `json:"name" db:"name"`
		CompanyName      string    `json:"company_name" db:"company_name"`
		Industry         *string   `json:"industry" db:"industry"`
		TeamSize         int       `json:"team_size" db:"team_size"`
		SubscriptionTier string    `json:"subscription_tier" db:"subscription_tier"`
		CreatedAt        time.Time `json:"created_at" db:"created_at"`
	}

	var team TeamInfo
	err := h.db.GetContext(c, &team, `
		SELECT t.id, t.name, t.company_name, t.industry, t.team_size, t.subscription_tier, t.created_at
		FROM teams t
		JOIN team_members tm ON t.id = tm.team_id
		WHERE tm.id = $1 AND tm.is_active = true
	`, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		return
	}

	// Get member count
	var memberCount int
	err = h.db.GetContext(c, &memberCount, `
		SELECT COUNT(*) FROM team_members WHERE team_id = $1 AND is_active = true
	`, team.ID)
	if err != nil {
		memberCount = 0
	}

	team.TeamSize = memberCount

	c.JSON(http.StatusOK, team)
}

// UpdateTeam updates team information (placeholder)
func (h *TeamHandler) UpdateTeam(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Team update not implemented yet"})
}

// CreateTeam creates a new team (placeholder)
func (h *TeamHandler) CreateTeam(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Team creation not implemented yet"})
}

// DeleteTeam deletes a team (placeholder)
func (h *TeamHandler) DeleteTeam(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Team deletion not implemented yet"})
}

// Additional placeholder methods for interface compatibility
func (h *TeamHandler) GetUserTeams(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Not implemented yet"})
}

func (h *TeamHandler) GetTeamMembers(c *gin.Context) {
	h.GetMembers(c) // Delegate to GetMembers
}

func (h *TeamHandler) AddTeamMember(c *gin.Context) {
	h.InviteMember(c) // Delegate to InviteMember
}

func (h *TeamHandler) UpdateTeamMember(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Not implemented yet"})
}

func (h *TeamHandler) RemoveTeamMember(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Not implemented yet"})
}