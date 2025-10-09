package handlers

import (
	"database/sql"
	"net/http"
	"time"

	"choseby-backend/internal/auth"
	"choseby-backend/internal/database"
	"choseby-backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// AuthHandler handles customer response team authentication
type AuthHandler struct {
	db          *database.DB
	authService *auth.AuthService
}

func NewAuthHandler(db *database.DB, authService *auth.AuthService) *AuthHandler {
	return &AuthHandler{
		db:          db,
		authService: authService,
	}
}

// Register handles team and team member registration
func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_request",
			"message": "Invalid request format",
			"details": err.Error(),
		})
		return
	}

	// Validate required fields
	if req.Email == "" || req.Name == "" || req.Password == "" || req.TeamName == "" || req.Company == "" || req.Role == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "missing_fields",
			"message": "All fields are required",
		})
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
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_role",
			"message": "Invalid role specified",
		})
		return
	}

	// Check if email already exists
	var existingUser int
	err := h.db.GetContext(c, &existingUser, `
		SELECT COUNT(*) FROM team_members WHERE email = $1
	`, req.Email)
	if err == nil && existingUser > 0 {
		c.JSON(http.StatusConflict, gin.H{
			"error":   "email_exists",
			"message": "Email already registered",
		})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "password_hash_failed",
			"message": "Failed to secure password",
		})
		return
	}

	// Start transaction
	tx, err := h.db.BeginTxx(c, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "transaction_failed",
			"message": "Failed to start registration process",
		})
		return
	}
	defer func() { _ = tx.Rollback() }() // Explicitly ignore rollback error (will fail if already committed)

	// Create team
	team := models.Team{
		ID:               uuid.New(),
		Name:             req.TeamName,
		CompanyName:      req.Company,
		TeamSize:         1,
		SubscriptionTier: "starter",
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	_, err = tx.NamedExecContext(c, `
		INSERT INTO teams (id, name, company_name, team_size, subscription_tier, created_at, updated_at)
		VALUES (:id, :name, :company_name, :team_size, :subscription_tier, :created_at, :updated_at)
	`, team)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "team_creation_failed",
			"message": "Failed to create team",
		})
		return
	}

	// Create team member
	member := models.TeamMember{
		ID:                      uuid.New(),
		TeamID:                  team.ID,
		Email:                   req.Email,
		Name:                    req.Name,
		PasswordHash:            string(hashedPassword),
		Role:                    req.Role,
		EscalationAuthority:     5, // First member gets highest authority
		NotificationPreferences: models.NotificationPrefs{Email: true, SMS: false, Push: true},
		IsActive:                true,
		CreatedAt:               time.Now(),
		UpdatedAt:               time.Now(),
	}

	_, err = tx.NamedExecContext(c, `
		INSERT INTO team_members (
			id, team_id, email, name, password_hash, role, escalation_authority,
			notification_preferences, is_active, created_at, updated_at
		) VALUES (
			:id, :team_id, :email, :name, :password_hash, :role, :escalation_authority,
			:notification_preferences, :is_active, :created_at, :updated_at
		)
	`, member)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "member_creation_failed",
			"message": "Failed to create team member",
		})
		return
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "registration_failed",
			"message": "Failed to complete registration",
		})
		return
	}

	// Generate JWT token
	token, expiresAt, err := h.authService.GenerateToken(member.ID.String(), member.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "token_generation_failed",
			"message": "Registration completed but login failed",
		})
		return
	}

	// Return response
	response := models.AuthResponse{
		Token:     token,
		User:      member,
		Team:      team,
		ExpiresAt: expiresAt,
	}

	c.JSON(http.StatusCreated, response)
}

// Login handles team member authentication
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_request",
			"message": "Invalid request format",
		})
		return
	}

	// Find user by email
	var member models.TeamMember
	err := h.db.GetContext(c, &member, `
		SELECT id, team_id, email, name, password_hash, role, escalation_authority,
			   notification_preferences, is_active, created_at, updated_at
		FROM team_members
		WHERE email = $1 AND is_active = true
	`, req.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "invalid_credentials",
				"message": "Invalid email or password",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "database_error",
				"message": "Login failed",
			})
		}
		return
	}

	// Verify password
	err = bcrypt.CompareHashAndPassword([]byte(member.PasswordHash), []byte(req.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "invalid_credentials",
			"message": "Invalid email or password",
		})
		return
	}

	// Get team information
	var team models.Team
	err = h.db.GetContext(c, &team, `
		SELECT id, name, company_name, industry, team_size, subscription_tier, created_at, updated_at
		FROM teams
		WHERE id = $1
	`, member.TeamID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "team_lookup_failed",
			"message": "Failed to retrieve team information",
		})
		return
	}

	// Generate JWT token
	token, expiresAt, err := h.authService.GenerateToken(member.ID.String(), member.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "token_generation_failed",
			"message": "Login failed",
		})
		return
	}

	// Return response
	response := models.AuthResponse{
		Token:     token,
		User:      member,
		Team:      team,
		ExpiresAt: expiresAt,
	}

	c.JSON(http.StatusOK, response)
}

// GetProfile returns the current user's profile
func (h *AuthHandler) GetProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get user profile
	var member models.TeamMember
	err := h.db.GetContext(c, &member, `
		SELECT id, team_id, email, name, role, escalation_authority,
			   notification_preferences, is_active, created_at, updated_at
		FROM team_members
		WHERE id = $1 AND is_active = true
	`, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
		return
	}

	// Get team information
	var team models.Team
	err = h.db.GetContext(c, &team, `
		SELECT id, name, company_name, industry, team_size, subscription_tier, created_at, updated_at
		FROM teams
		WHERE id = $1
	`, member.TeamID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve team information"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": member,
		"team": team,
	})
}

// UpdateProfile updates the current user's profile
func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	type UpdateProfileRequest struct {
		Name                    *string                   `json:"name,omitempty"`
		NotificationPreferences *models.NotificationPrefs `json:"notification_preferences,omitempty"`
	}

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	// Build update query dynamically
	updates := make(map[string]interface{})
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.NotificationPreferences != nil {
		updates["notification_preferences"] = *req.NotificationPreferences
	}
	updates["updated_at"] = time.Now()

	if len(updates) == 1 { // Only updated_at
		c.JSON(http.StatusBadRequest, gin.H{"error": "No fields to update"})
		return
	}

	// Update profile
	query := `
		UPDATE team_members SET
			name = COALESCE(:name, name),
			notification_preferences = COALESCE(:notification_preferences, notification_preferences),
			updated_at = :updated_at
		WHERE id = :user_id
	`

	updates["user_id"] = userID
	_, err := h.db.NamedExecContext(c, query, updates)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully"})
}

// Logout handles user logout (placeholder for token invalidation)
func (h *AuthHandler) Logout(c *gin.Context) {
	// In a complete implementation, this would:
	// 1. Add the token to a blacklist
	// 2. Clear any session data
	// 3. Log the logout event

	c.JSON(http.StatusOK, gin.H{
		"message": "Logged out successfully",
	})
}

// RefreshToken handles token refresh (placeholder)
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Token refresh not implemented yet"})
}

// Additional placeholder methods for SSO compatibility
func (h *AuthHandler) EpicSSO(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "SSO not available for customer response platform"})
}

func (h *AuthHandler) CernerSSO(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "SSO not available for customer response platform"})
}
