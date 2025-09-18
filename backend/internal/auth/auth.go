package auth

import (
	"errors"
	"time"

	"choseby-backend/internal/models"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type Claims struct {
	UserID      uuid.UUID `json:"sub"`
	Email       string    `json:"email"`
	Role        string    `json:"role"`
	Teams       []string  `json:"teams"`
	Permissions []string  `json:"permissions"`
	jwt.RegisteredClaims
}

type AuthService struct {
	jwtSecret              []byte
	jwtExpiration          time.Duration
	refreshTokenExpiration time.Duration
}

func NewAuthService(jwtSecret string, jwtExpiration, refreshTokenExpiration int) *AuthService {
	return &AuthService{
		jwtSecret:              []byte(jwtSecret),
		jwtExpiration:          time.Duration(jwtExpiration) * time.Second,
		refreshTokenExpiration: time.Duration(refreshTokenExpiration) * time.Second,
	}
}

// GenerateToken creates a JWT token for authenticated user
func (a *AuthService) GenerateToken(user *models.User, teams []string, permissions []string) (string, error) {
	now := time.Now()
	claims := &Claims{
		UserID:      user.ID,
		Email:       user.Email,
		Role:        user.Role,
		Teams:       teams,
		Permissions: permissions,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(a.jwtExpiration)),
			Subject:   user.ID.String(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(a.jwtSecret)
}

// GenerateRefreshToken creates a refresh token
func (a *AuthService) GenerateRefreshToken(userID uuid.UUID) (string, error) {
	now := time.Now()
	claims := &jwt.RegisteredClaims{
		Subject:   userID.String(),
		IssuedAt:  jwt.NewNumericDate(now),
		ExpiresAt: jwt.NewNumericDate(now.Add(a.refreshTokenExpiration)),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(a.jwtSecret)
}

// ValidateToken verifies and parses a JWT token
func (a *AuthService) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return a.jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

// HashPassword creates a bcrypt hash of the password
func (a *AuthService) HashPassword(password string) (string, error) {
	// Use higher cost for healthcare security
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

// VerifyPassword compares password with hash
func (a *AuthService) VerifyPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// HasPermission checks if user has specific permission
func (c *Claims) HasPermission(permission string) bool {
	for _, p := range c.Permissions {
		if p == permission {
			return true
		}
	}
	return false
}

// IsTeamMember checks if user is member of specific team
func (c *Claims) IsTeamMember(teamID string) bool {
	for _, t := range c.Teams {
		if t == teamID {
			return true
		}
	}
	return false
}

// Healthcare SSO integration structures
type EpicSSORequest struct {
	AuthorizationCode string `json:"authorization_code"`
	RedirectURI       string `json:"redirect_uri"`
}

type CernerSSORequest struct {
	AccessToken string `json:"access_token"`
	UserInfo    string `json:"user_info"`
}

type SSOUserInfo struct {
	Email         string  `json:"email"`
	Name          string  `json:"name"`
	Role          string  `json:"role"`
	Department    *string `json:"department"`
	LicenseNumber *string `json:"license_number"`
	Provider      string  `json:"provider"` // epic, cerner, allscripts
}

// ProcessEpicSSO handles Epic MyChart authentication
func (a *AuthService) ProcessEpicSSO(request EpicSSORequest) (*SSOUserInfo, error) {
	// In production, this would:
	// 1. Exchange authorization code for access token
	// 2. Fetch user info from Epic FHIR API
	// 3. Map Epic user data to our user structure

	// Mock implementation for development
	return &SSOUserInfo{
		Email:      "epic.user@hospital.com",
		Name:       "Dr. Epic User",
		Role:       "physician",
		Department: stringPtr("Emergency Medicine"),
		Provider:   "epic",
	}, nil
}

// ProcessCernerSSO handles Cerner PowerChart authentication
func (a *AuthService) ProcessCernerSSO(request CernerSSORequest) (*SSOUserInfo, error) {
	// In production, this would:
	// 1. Validate access token with Cerner
	// 2. Fetch user profile from Cerner API
	// 3. Map Cerner user data to our user structure

	// Mock implementation for development
	return &SSOUserInfo{
		Email:         "cerner.user@hospital.com",
		Name:          "Nurse Cerner User",
		Role:          "nurse",
		Department:    stringPtr("ICU"),
		LicenseNumber: stringPtr("RN-12345"),
		Provider:      "cerner",
	}, nil
}

func stringPtr(s string) *string {
	return &s
}