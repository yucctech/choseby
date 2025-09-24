package handlers

import (
	"database/sql"
	"log"
	"net/http"

	"choseby-backend/internal/auth"
	"choseby-backend/internal/database"
	"choseby-backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lib/pq"
)

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

// Login handles user authentication
func (h *AuthHandler) Login(c *gin.Context) {
	var request models.LoginRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_request",
			"message": err.Error(),
		})
		return
	}

	// Authenticate user
	user, teams, permissions, err := h.authenticateUser(request.Email, request.Password)
	if err != nil {
		// Log failed login attempt for HIPAA audit
		h.db.AuditLog("", "login_failed", "", map[string]interface{}{
			"email": request.Email,
			"ip":    c.ClientIP(),
		})

		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "Invalid email or password",
		})
		return
	}

	// Generate tokens
	accessToken, err := h.authService.GenerateToken(user, teams, permissions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "internal_error",
			"message": "Failed to generate access token",
		})
		return
	}

	refreshToken, err := h.authService.GenerateRefreshToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "internal_error",
			"message": "Failed to generate refresh token",
		})
		return
	}

	// Store session
	err = h.storeUserSession(user.ID, accessToken, refreshToken, request.SSOProvider)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "internal_error",
			"message": "Failed to create session",
		})
		return
	}

	// Update last login (note: public.users doesn't have last_login column)
	// h.db.Exec("UPDATE users SET updated_at = NOW() WHERE id = $1", user.ID)

	// Log successful login for HIPAA audit
	h.db.AuditLog(user.ID.String(), "user_login", user.ID.String(), map[string]interface{}{
		"ip": c.ClientIP(),
	})

	// Return response
	response := models.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    3600, // From config
		User:         *user,
	}

	c.JSON(http.StatusOK, response)
}

// RefreshToken handles token refresh
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var request struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_request",
			"message": "Refresh token is required",
		})
		return
	}

	// Validate refresh token and get user
	userID, err := h.validateRefreshToken(request.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "Invalid or expired refresh token",
		})
		return
	}

	// Get current user data
	user, teams, permissions, err := h.getUserWithTeams(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "internal_error",
			"message": "Failed to get user data",
		})
		return
	}

	// Generate new access token
	newAccessToken, err := h.authService.GenerateToken(user, teams, permissions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "internal_error",
			"message": "Failed to generate new access token",
		})
		return
	}

	// Update session
	h.db.Exec(
		"UPDATE user_sessions SET session_token = $1, last_accessed = NOW() WHERE refresh_token = $2",
		newAccessToken, request.RefreshToken,
	)

	c.JSON(http.StatusOK, gin.H{
		"access_token": newAccessToken,
		"expires_in":   3600,
	})
}

// EpicSSO handles Epic MyChart SSO authentication
func (h *AuthHandler) EpicSSO(c *gin.Context) {
	var request auth.EpicSSORequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_request",
			"message": err.Error(),
		})
		return
	}

	// Process Epic SSO
	ssoUserInfo, err := h.authService.ProcessEpicSSO(request)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "sso_error",
			"message": "Failed to authenticate with Epic",
		})
		return
	}

	// Find or create user
	user, err := h.findOrCreateSSOUser(ssoUserInfo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "internal_error",
			"message": "Failed to process SSO user",
		})
		return
	}

	// Complete login process (same as regular login)
	h.completeSSOLogin(c, user, "epic")
}

// CernerSSO handles Cerner PowerChart SSO authentication
func (h *AuthHandler) CernerSSO(c *gin.Context) {
	var request auth.CernerSSORequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_request",
			"message": err.Error(),
		})
		return
	}

	// Process Cerner SSO
	ssoUserInfo, err := h.authService.ProcessCernerSSO(request)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "sso_error",
			"message": "Failed to authenticate with Cerner",
		})
		return
	}

	// Find or create user
	user, err := h.findOrCreateSSOUser(ssoUserInfo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "internal_error",
			"message": "Failed to process SSO user",
		})
		return
	}

	// Complete login process
	h.completeSSOLogin(c, user, "cerner")
}

// GetProfile returns current user profile
func (h *AuthHandler) GetProfile(c *gin.Context) {
	claims := c.MustGet("claims").(*auth.Claims)

	user, err := h.getUserByID(claims.UserID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "user_not_found",
			"message": "User not found",
		})
		return
	}

	c.JSON(http.StatusOK, user)
}

// UpdateProfile updates user profile
func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	claims := c.MustGet("claims").(*auth.Claims)

	var updateData struct {
		Name       string  `json:"name"`
		Department *string `json:"department"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_request",
			"message": err.Error(),
		})
		return
	}

	// Update user
	_, err := h.db.Exec(
		"UPDATE users SET name = $1, department = $2, updated_at = NOW() WHERE id = $3",
		updateData.Name, updateData.Department, claims.UserID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "internal_error",
			"message": "Failed to update profile",
		})
		return
	}

	// Log profile update for HIPAA audit
	h.db.AuditLog(claims.UserID.String(), "profile_updated", claims.UserID.String(), map[string]interface{}{
		"updated_fields": []string{"name", "department"},
	})

	c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully"})
}

// Logout invalidates user session
func (h *AuthHandler) Logout(c *gin.Context) {
	claims := c.MustGet("claims").(*auth.Claims)

	// Delete session
	h.db.Exec("DELETE FROMuser_sessions WHERE user_id = $1", claims.UserID)

	// Log logout for HIPAA audit
	h.db.AuditLog(claims.UserID.String(), "user_logout", claims.UserID.String(), nil)

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// Helper methods

func (h *AuthHandler) authenticateUser(email, password string) (*models.User, []string, []string, error) {
	var user models.User
	err := h.db.QueryRow(
		"SELECT id, email, name, role, department, password_hash FROM public.users WHERE email = $1",
		email,
	).Scan(&user.ID, &user.Email, &user.Name, &user.Role, &user.Department, &user.PasswordHash)

	if err != nil {
		return nil, nil, nil, err
	}

	// Verify password
	if !h.authService.VerifyPassword(password, user.PasswordHash) {
		log.Printf("Password verification failed for user: %s", user.Email)
		return nil, nil, nil, sql.ErrNoRows
	}

	// Get teams and permissions
	teams, permissions, err := h.getUserTeamsAndPermissions(user.ID)
	return &user, teams, permissions, err
}

func (h *AuthHandler) getUserWithTeams(userID uuid.UUID) (*models.User, []string, []string, error) {
	var user models.User
	err := h.db.QueryRow(
		"SELECT id, email, name, role, department FROMusers WHERE id = $1",
		userID,
	).Scan(&user.ID, &user.Email, &user.Name, &user.Role, &user.Department)

	if err != nil {
		return nil, nil, nil, err
	}

	teams, permissions, err := h.getUserTeamsAndPermissions(userID)
	return &user, teams, permissions, err
}

func (h *AuthHandler) getUserTeamsAndPermissions(userID uuid.UUID) ([]string, []string, error) {
	rows, err := h.db.Query(
		"SELECT tm.team_id, tm.permissions FROM team_members tm WHERE tm.user_id = $1",
		userID,
	)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	var teams []string
	var allPermissions []string

	for rows.Next() {
		var teamID string
		var permissions pq.StringArray

		err := rows.Scan(&teamID, &permissions)
		if err != nil {
			return nil, nil, err
		}

		teams = append(teams, teamID)
		allPermissions = append(allPermissions, permissions...)
	}

	// Remove duplicate permissions
	permissionSet := make(map[string]bool)
	var uniquePermissions []string
	for _, p := range allPermissions {
		if !permissionSet[p] {
			permissionSet[p] = true
			uniquePermissions = append(uniquePermissions, p)
		}
	}

	return teams, uniquePermissions, nil
}

func (h *AuthHandler) storeUserSession(userID uuid.UUID, accessToken, refreshToken string, ssoProvider *string) error {
	_, err := h.db.Exec(`
		INSERT INTO user_sessions (user_id, session_token, refresh_token, sso_provider, expires_at)
		VALUES ($1, $2, $3, $4, NOW() + INTERVAL '3600 seconds')
	`, userID, accessToken, refreshToken, ssoProvider)
	return err
}

func (h *AuthHandler) validateRefreshToken(refreshToken string) (uuid.UUID, error) {
	var userID uuid.UUID
	err := h.db.QueryRow(
		"SELECT user_id FROMuser_sessions WHERE refresh_token = $1 AND expires_at > NOW()",
		refreshToken,
	).Scan(&userID)
	return userID, err
}

func (h *AuthHandler) getUserByID(userID uuid.UUID) (*models.User, error) {
	var user models.User
	err := h.db.QueryRow(
		"SELECT id, email, name, role, department, created_at FROM users WHERE id = $1",
		userID,
	).Scan(&user.ID, &user.Email, &user.Name, &user.Role, &user.Department, &user.CreatedAt)
	return &user, err
}

func (h *AuthHandler) findOrCreateSSOUser(ssoUserInfo *auth.SSOUserInfo) (*models.User, error) {
	// Try to find existing user
	var user models.User
	err := h.db.QueryRow(
		"SELECT id, email, name, role, department FROM users WHERE email = $1",
		ssoUserInfo.Email,
	).Scan(&user.ID, &user.Email, &user.Name, &user.Role, &user.Department)

	if err == sql.ErrNoRows {
		// Create new user
		user.ID = uuid.New()
		user.Email = ssoUserInfo.Email
		user.Name = ssoUserInfo.Name
		user.Role = ssoUserInfo.Role
		user.Department = ssoUserInfo.Department

		// Generate a placeholder password hash for SSO users
		passwordHash, _ := h.authService.HashPassword(uuid.New().String())

		_, err = h.db.Exec(`
			INSERT INTO users (id, email, name, role, department, password_hash)
			VALUES ($1, $2, $3, $4, $5, $6)
		`, user.ID, user.Email, user.Name, user.Role, user.Department, passwordHash)

		if err != nil {
			return nil, err
		}
	} else if err != nil {
		return nil, err
	}

	return &user, nil
}

func (h *AuthHandler) completeSSOLogin(c *gin.Context, user *models.User, provider string) {
	// Get teams and permissions
	teams, permissions, err := h.getUserTeamsAndPermissions(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "internal_error",
			"message": "Failed to get user teams",
		})
		return
	}

	// Generate tokens
	accessToken, err := h.authService.GenerateToken(user, teams, permissions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "internal_error",
			"message": "Failed to generate access token",
		})
		return
	}

	refreshToken, err := h.authService.GenerateRefreshToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "internal_error",
			"message": "Failed to generate refresh token",
		})
		return
	}

	// Store session
	ssoProviderPtr := &provider
	err = h.storeUserSession(user.ID, accessToken, refreshToken, ssoProviderPtr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "internal_error",
			"message": "Failed to create session",
		})
		return
	}

	// Update last login (note: public.users doesn't have last_login column)
	// h.db.Exec("UPDATE users SET updated_at = NOW() WHERE id = $1", user.ID)

	// Log SSO login for HIPAA audit
	h.db.AuditLog(user.ID.String(), "sso_login", user.ID.String(), map[string]interface{}{
		"provider": provider,
		"ip":       c.ClientIP(),
	})

	// Return response
	response := models.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    3600,
		User:         *user,
	}

	c.JSON(http.StatusOK, response)
}