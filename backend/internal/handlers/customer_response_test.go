package handlers

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

	"choseby-backend/internal/models"
	"choseby-backend/internal/testutil"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/suite"
)

type CustomerResponseHandlerTestSuite struct {
	testutil.TestSuite
	Handler *DecisionsHandler
	Router  *gin.Engine
}

func (s *CustomerResponseHandlerTestSuite) SetupTest() {
	s.TestSuite.SetupTest()

	// Initialize handler
	s.Handler = NewDecisionsHandler(s.DB, s.AuthService)

	// Setup Gin router with auth middleware mock
	gin.SetMode(gin.TestMode)
	s.Router = gin.New()

	// Mock auth middleware
	s.Router.Use(func(c *gin.Context) {
		// Set mock user context
		c.Set("user_id", testutil.MustParseUUID("550e8400-e29b-41d4-a716-446655440000"))
		c.Set("user_email", "test@example.com")
		c.Set("user_role", "customer_success_manager")
		c.Next()
	})

	s.Router.GET("/decisions", s.Handler.GetTeamDecisions)
	s.Router.POST("/decisions", s.Handler.CreateDecision)
	s.Router.GET("/decisions/:id", s.Handler.GetDecision)
	s.Router.PUT("/decisions/:id", s.Handler.UpdateDecision)
	s.Router.DELETE("/decisions/:id", s.Handler.DeleteDecision)
}

func (s *CustomerResponseHandlerTestSuite) TestGetTeamDecisions_Success() {
	userID := "550e8400-e29b-41d4-a716-446655440000"
	teamID := "550e8400-e29b-41d4-a716-446655440001"

	// Mock team ID lookup
	s.Mock.ExpectQuery(regexp.QuoteMeta(`SELECT team_id FROM team_members WHERE id = $1`)).
		WithArgs(userID).
		WillReturnRows(sqlmock.NewRows([]string{"team_id"}).AddRow(teamID))

	// Mock decisions query
	rows := sqlmock.NewRows([]string{
		"id", "team_id", "customer_name", "decision_type", "urgency_level",
		"status", "current_phase", "created_at", "created_by",
	}).AddRow(
		"550e8400-e29b-41d4-a716-446655440002", teamID, "Acme Corp",
		"refund_request", 4, "created", 1, "2023-01-01T00:00:00Z", userID,
	)

	s.Mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, team_id, customer_name, decision_type, urgency_level, status, current_phase, created_at, created_by FROM customer_decisions`)).
		WillReturnRows(rows)

	// Execute request
	request := httptest.NewRequest(http.MethodGet, "/decisions", nil)
	recorder := httptest.NewRecorder()
	s.Router.ServeHTTP(recorder, request)

	// Assertions
	s.Equal(http.StatusOK, recorder.Code)

	var response []models.CustomerDecision
	err := json.Unmarshal(recorder.Body.Bytes(), &response)
	s.NoError(err)
	s.Len(response, 1)
	s.Equal("Acme Corp", response[0].CustomerName)
	s.Equal("refund_request", response[0].DecisionType)
}

func (s *CustomerResponseHandlerTestSuite) TestCreateDecision_Success() {
	userID := "550e8400-e29b-41d4-a716-446655440000"
	teamID := "550e8400-e29b-41d4-a716-446655440001"

	customerValue := 50000.0
	financialImpact := 5000.0
	req := models.CreateDecisionRequest{
		CustomerName:               "Acme Corp",
		DecisionType:               "refund_request",
		UrgencyLevel:               4,
		CustomerTier:               "enterprise",
		CustomerValue:              &customerValue,
		RelationshipDurationMonths: 24,
		Title:                      "Refund Request",
		Description:                "Customer requesting full refund due to service issues",
		FinancialImpact:            &financialImpact,
	}

	// Mock team ID lookup
	s.Mock.ExpectQuery(regexp.QuoteMeta(`SELECT team_id FROM team_members WHERE id = $1`)).
		WithArgs(userID).
		WillReturnRows(sqlmock.NewRows([]string{"team_id"}).AddRow(teamID))

	// Mock decision creation
	s.Mock.ExpectExec(regexp.QuoteMeta(`INSERT INTO customer_decisions`)).
		WithArgs(sqlmock.AnyArg(), teamID, sqlmock.AnyArg(), "Acme Corp", "refund_request",
			"Customer requesting full refund due to service issues", 4, "created", 1,
			"enterprise", 50000.0, 24, 5000.0, sqlmock.AnyArg()).
		WillReturnResult(sqlmock.NewResult(1, 1))

	reqBody, _ := json.Marshal(req)
	request := httptest.NewRequest(http.MethodPost, "/decisions", bytes.NewBuffer(reqBody))
	request.Header.Set("Content-Type", "application/json")

	recorder := httptest.NewRecorder()
	s.Router.ServeHTTP(recorder, request)

	// Assertions
	s.Equal(http.StatusCreated, recorder.Code)

	var response map[string]interface{}
	err := json.Unmarshal(recorder.Body.Bytes(), &response)
	s.NoError(err)

	s.Contains(response, "decision_id")
	s.Equal("Decision created successfully", response["message"])
}

func (s *CustomerResponseHandlerTestSuite) TestCreateDecision_ValidationError() {
	// Test with missing required fields
	req := models.CreateDecisionRequest{
		CustomerName: "Acme Corp",
		// Missing DecisionType, UrgencyLevel, etc.
	}

	reqBody, _ := json.Marshal(req)
	request := httptest.NewRequest(http.MethodPost, "/decisions", bytes.NewBuffer(reqBody))
	request.Header.Set("Content-Type", "application/json")

	recorder := httptest.NewRecorder()
	s.Router.ServeHTTP(recorder, request)

	// Assertions
	s.Equal(http.StatusBadRequest, recorder.Code)

	var response map[string]interface{}
	err := json.Unmarshal(recorder.Body.Bytes(), &response)
	s.NoError(err)

	s.Equal("validation_failed", response["error"])
}

func (s *CustomerResponseHandlerTestSuite) TestGetDecision_Success() {
	decisionID := "550e8400-e29b-41d4-a716-446655440002"
	userID := "550e8400-e29b-41d4-a716-446655440000"
	teamID := "550e8400-e29b-41d4-a716-446655440001"

	// Mock team ID lookup
	s.Mock.ExpectQuery(regexp.QuoteMeta(`SELECT team_id FROM team_members WHERE id = $1`)).
		WithArgs(userID).
		WillReturnRows(sqlmock.NewRows([]string{"team_id"}).AddRow(teamID))

	// Mock decision query
	rows := sqlmock.NewRows([]string{
		"id", "team_id", "customer_name", "decision_type", "urgency_level",
		"status", "current_phase", "created_at", "created_by",
	}).AddRow(
		decisionID, teamID, "Acme Corp", "refund_request", 4,
		"created", 1, "2023-01-01T00:00:00Z", userID,
	)

	s.Mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, team_id, customer_name, decision_type, urgency_level, status, current_phase, created_at, created_by FROM customer_decisions WHERE id = $1 AND team_id = $2`)).
		WithArgs(decisionID, teamID).
		WillReturnRows(rows)

	// Mock criteria query
	s.Mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, decision_id, name, description, weight, created_at FROM decision_criteria WHERE decision_id = $1`)).
		WithArgs(decisionID).
		WillReturnRows(sqlmock.NewRows([]string{"id", "decision_id", "name", "description", "weight", "created_at"}))

	// Mock response options query
	s.Mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, decision_id, title, description, financial_cost, implementation_effort, risk_level, created_at FROM response_options WHERE decision_id = $1`)).
		WithArgs(decisionID).
		WillReturnRows(sqlmock.NewRows([]string{"id", "decision_id", "title", "description", "financial_cost", "implementation_effort", "risk_level", "created_at"}))

	request := httptest.NewRequest(http.MethodGet, "/decisions/"+decisionID, nil)
	recorder := httptest.NewRecorder()
	s.Router.ServeHTTP(recorder, request)

	// Assertions
	s.Equal(http.StatusOK, recorder.Code)

	var response map[string]interface{}
	err := json.Unmarshal(recorder.Body.Bytes(), &response)
	s.NoError(err)

	decision := response["decision"].(map[string]interface{})
	s.Equal("Acme Corp", decision["customer_name"])
	s.Equal("refund_request", decision["decision_type"])
}

func (s *CustomerResponseHandlerTestSuite) TestGetDecision_NotFound() {
	decisionID := "550e8400-e29b-41d4-a716-446655440002"
	userID := "550e8400-e29b-41d4-a716-446655440000"
	teamID := "550e8400-e29b-41d4-a716-446655440001"

	// Mock team ID lookup
	s.Mock.ExpectQuery(regexp.QuoteMeta(`SELECT team_id FROM team_members WHERE id = $1`)).
		WithArgs(userID).
		WillReturnRows(sqlmock.NewRows([]string{"team_id"}).AddRow(teamID))

	// Mock decision not found
	s.Mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, team_id, customer_name, decision_type, urgency_level, status, current_phase, created_at, created_by FROM customer_decisions WHERE id = $1 AND team_id = $2`)).
		WithArgs(decisionID, teamID).
		WillReturnError(sql.ErrNoRows)

	request := httptest.NewRequest(http.MethodGet, "/decisions/"+decisionID, nil)
	recorder := httptest.NewRecorder()
	s.Router.ServeHTTP(recorder, request)

	// Assertions
	s.Equal(http.StatusNotFound, recorder.Code)

	var response map[string]interface{}
	err := json.Unmarshal(recorder.Body.Bytes(), &response)
	s.NoError(err)

	s.Equal("decision_not_found", response["error"])
}

func (s *CustomerResponseHandlerTestSuite) TestDeleteDecision_Success() {
	decisionID := "550e8400-e29b-41d4-a716-446655440002"
	userID := "550e8400-e29b-41d4-a716-446655440000"
	teamID := "550e8400-e29b-41d4-a716-446655440001"

	// Mock team ID lookup
	s.Mock.ExpectQuery(regexp.QuoteMeta(`SELECT team_id FROM team_members WHERE id = $1`)).
		WithArgs(userID).
		WillReturnRows(sqlmock.NewRows([]string{"team_id"}).AddRow(teamID))

	// Mock decision deletion
	s.Mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM customer_decisions WHERE id = $1 AND team_id = $2`)).
		WithArgs(decisionID, teamID).
		WillReturnResult(sqlmock.NewResult(1, 1))

	request := httptest.NewRequest(http.MethodDelete, "/decisions/"+decisionID, nil)
	recorder := httptest.NewRecorder()
	s.Router.ServeHTTP(recorder, request)

	// Assertions
	s.Equal(http.StatusOK, recorder.Code)

	var response map[string]interface{}
	err := json.Unmarshal(recorder.Body.Bytes(), &response)
	s.NoError(err)

	s.Equal("Decision deleted successfully", response["message"])
}

func TestCustomerResponseHandlerTestSuite(t *testing.T) {
	suite.Run(t, new(CustomerResponseHandlerTestSuite))
}
