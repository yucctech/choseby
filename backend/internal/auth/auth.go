package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type Claims struct {
	UserID      uuid.UUID `json:"sub"`
	Email       string    `json:"email"`
	Role        string    `json:"role"`
	TeamID      string    `json:"team_id"`
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

// GenerateToken creates a JWT token for authenticated team member
func (a *AuthService) GenerateToken(userID, role string) (string, time.Time, error) {
	now := time.Now()
	expiresAt := now.Add(a.jwtExpiration)

	claims := &Claims{
		UserID: uuid.MustParse(userID),
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			Subject:   userID,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(a.jwtSecret)
	if err != nil {
		return "", time.Time{}, err
	}

	return tokenString, expiresAt, nil
}

// ValidateToken validates and parses a JWT token
func (a *AuthService) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return a.jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

// GenerateRefreshToken creates a refresh token (placeholder implementation)
func (a *AuthService) GenerateRefreshToken(userID string) (string, time.Time, error) {
	// In a complete implementation, this would:
	// 1. Generate a unique refresh token
	// 2. Store it in the database with expiration
	// 3. Return the token and expiration time

	now := time.Now()
	expiresAt := now.Add(a.refreshTokenExpiration)

	claims := &Claims{
		UserID: uuid.MustParse(userID),
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			Subject:   userID,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(a.jwtSecret)
	if err != nil {
		return "", time.Time{}, err
	}

	return tokenString, expiresAt, nil
}

// HashPassword hashes a password using bcrypt
func (a *AuthService) HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}

// VerifyPassword verifies a password against its hash
func (a *AuthService) VerifyPassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}