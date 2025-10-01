package testutil

import (
	"choseby-backend/internal/auth"
	"choseby-backend/internal/database"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/suite"
)

// TestSuite provides common test setup for all handler tests
type TestSuite struct {
	suite.Suite
	DB          *database.DB
	Mock        sqlmock.Sqlmock
	AuthService *auth.AuthService
}

// SetupTest initializes test dependencies before each test
func (s *TestSuite) SetupTest() {
	// Create mock database
	mockDB, mock, err := sqlmock.New()
	s.Require().NoError(err)

	// Wrap with sqlx
	sqlxDB := sqlx.NewDb(mockDB, "sqlmock")
	s.DB = &database.DB{DB: sqlxDB}
	s.Mock = mock

	// Initialize auth service
	s.AuthService = auth.NewAuthService("test-secret", 3600, 86400)
}

// TearDownTest cleans up after each test
func (s *TestSuite) TearDownTest() {
	s.DB.Close()
	s.NoError(s.Mock.ExpectationsWereMet())
}

// Helper functions for test data generation

// MockTeamMember creates test team member data
func MockTeamMember() map[string]interface{} {
	return map[string]interface{}{
		"id":                   "550e8400-e29b-41d4-a716-446655440000",
		"team_id":              "550e8400-e29b-41d4-a716-446655440001",
		"name":                 "John Doe",
		"email":                "john@example.com",
		"role":                 "customer_success_manager",
		"escalation_authority": 5,
		"created_at":           time.Now(),
	}
}

// MockCustomerDecision creates test customer decision data
func MockCustomerDecision() map[string]interface{} {
	return map[string]interface{}{
		"id":            "550e8400-e29b-41d4-a716-446655440002",
		"team_id":       "550e8400-e29b-41d4-a716-446655440001",
		"customer_name": "Acme Corp",
		"decision_type": "refund_request",
		"urgency_level": 4,
		"status":        "created",
		"current_phase": 1,
		"created_at":    time.Now(),
	}
}

// MockEvaluation creates test evaluation data
func MockEvaluation() map[string]interface{} {
	return map[string]interface{}{
		"id":                 "550e8400-e29b-41d4-a716-446655440003",
		"decision_id":        "550e8400-e29b-41d4-a716-446655440002",
		"user_id":            "550e8400-e29b-41d4-a716-446655440000",
		"overall_confidence": 4,
		"evaluation_notes":   "Test evaluation",
		"created_at":         time.Now(),
	}
}

// MockJWTClaims creates test JWT claims
func MockJWTClaims() *auth.Claims {
	return &auth.Claims{
		UserID: MustParseUUID("550e8400-e29b-41d4-a716-446655440000"),
		Email:  "john@example.com",
		Role:   "customer_success_manager",
		TeamID: "550e8400-e29b-41d4-a716-446655440001",
	}
}

// Helper to parse UUID for tests
func MustParseUUID(s string) uuid.UUID {
	u, err := uuid.Parse(s)
	if err != nil {
		panic(err)
	}
	return u
}
