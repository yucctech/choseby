package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

	"choseby-backend/internal/models"
	"choseby-backend/internal/testutil"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/suite"
)

type EvaluationHandlerTestSuite struct {
	testutil.TestSuite
	Handler *EvaluationHandler
	Router  *gin.Engine
}

func (s *EvaluationHandlerTestSuite) SetupTest() {
	s.TestSuite.SetupTest()

	// Initialize handler
	s.Handler = NewEvaluationHandler(s.DB, s.AuthService)

	// Setup Gin router with auth middleware mock
	gin.SetMode(gin.TestMode)
	s.Router = gin.New()

	// Mock auth middleware
	s.Router.Use(func(c *gin.Context) {
		claims := testutil.MockJWTClaims()
		c.Set("claims", claims)
		c.Set("user_id", claims.UserID)
		c.Set("user_email", claims.Email)
		c.Set("user_role", claims.Role)
		c.Next()
	})

	s.Router.GET("/decisions/:decisionId/teams/:teamId/evaluation-status", s.Handler.GetEvaluationStatus)
	s.Router.POST("/decisions/:decisionId/evaluations", s.Handler.SubmitEvaluation)
	s.Router.GET("/decisions/:decisionId/evaluation-summary", s.Handler.GetEvaluationSummary)
	s.Router.GET("/decisions/:decisionId/export", s.Handler.ExportEvaluations)
}

func (s *EvaluationHandlerTestSuite) TestGetEvaluationStatus_Success() {
	decisionID := "550e8400-e29b-41d4-a716-446655440002"
	teamID := "550e8400-e29b-41d4-a716-446655440001"

	// Mock team member count
	s.Mock.ExpectQuery(regexp.QuoteMeta(`SELECT COUNT(*) FROM team_members WHERE team_id = $1`)).
		WithArgs(teamID).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(5))

	// Mock evaluation count
	s.Mock.ExpectQuery(regexp.QuoteMeta(`SELECT COUNT(*) FROM evaluations WHERE decision_id = $1`)).
		WithArgs(decisionID).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(3))

	request := httptest.NewRequest(http.MethodGet, "/decisions/"+decisionID+"/teams/"+teamID+"/evaluation-status", nil)
	recorder := httptest.NewRecorder()
	s.Router.ServeHTTP(recorder, request)

	// Assertions
	s.Equal(http.StatusOK, recorder.Code)

	var response map[string]interface{}
	err := json.Unmarshal(recorder.Body.Bytes(), &response)
	s.NoError(err)

	s.Equal(decisionID, response["decision_id"])
	s.Equal(float64(5), response["total_team_members"])
	s.Equal(float64(3), response["evaluations_completed"])
	s.Equal(float64(60), response["completion_percentage"]) // 3/5 * 100
	s.Equal(float64(0), response["consensus_level"])
}

func (s *EvaluationHandlerTestSuite) TestSubmitEvaluation_Success() {
	decisionID := "550e8400-e29b-41d4-a716-446655440002"

	req := models.EvaluationRequest{
		Evaluations: []models.EvaluationScore{
			{
				OptionID:   uuid.MustParse("550e8400-e29b-41d4-a716-446655440003"),
				CriteriaID: uuid.MustParse("550e8400-e29b-41d4-a716-446655440004"),
				Score:      8,
				Confidence: 4,
				Comment:    stringPtr("Good option"),
			},
			{
				OptionID:   uuid.MustParse("550e8400-e29b-41d4-a716-446655440005"),
				CriteriaID: uuid.MustParse("550e8400-e29b-41d4-a716-446655440004"),
				Score:      6,
				Confidence: 3,
				Comment:    stringPtr("Decent alternative"),
			},
		},
	}

	userID := testutil.MustParseUUID("550e8400-e29b-41d4-a716-446655440000")

	// Mock transaction
	s.Mock.ExpectBegin()

	// Mock evaluation creation
	s.Mock.ExpectExec(regexp.QuoteMeta(`INSERT INTO evaluations`)).
		WithArgs(sqlmock.AnyArg(), decisionID, userID, 5, "").
		WillReturnResult(sqlmock.NewResult(1, 1))

	// Mock evaluation scores insertion
	s.Mock.ExpectExec(regexp.QuoteMeta(`INSERT INTO evaluation_scores`)).
		WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg(), req.Evaluations[0].OptionID, req.Evaluations[0].CriteriaID,
			req.Evaluations[0].Score, req.Evaluations[0].Comment, req.Evaluations[0].Confidence).
		WillReturnResult(sqlmock.NewResult(1, 1))

	s.Mock.ExpectExec(regexp.QuoteMeta(`INSERT INTO evaluation_scores`)).
		WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg(), req.Evaluations[1].OptionID, req.Evaluations[1].CriteriaID,
			req.Evaluations[1].Score, req.Evaluations[1].Comment, req.Evaluations[1].Confidence).
		WillReturnResult(sqlmock.NewResult(1, 1))

	s.Mock.ExpectCommit()

	// Mock completion status query
	s.Mock.ExpectQuery(regexp.QuoteMeta(`SELECT`)).
		WillReturnRows(sqlmock.NewRows([]string{"completed", "total"}).AddRow(4, 5))

	reqBody, _ := json.Marshal(req)
	request := httptest.NewRequest(http.MethodPost, "/decisions/"+decisionID+"/evaluations", bytes.NewBuffer(reqBody))
	request.Header.Set("Content-Type", "application/json")

	recorder := httptest.NewRecorder()
	s.Router.ServeHTTP(recorder, request)

	// Assertions
	s.Equal(http.StatusCreated, recorder.Code)

	var response map[string]interface{}
	err := json.Unmarshal(recorder.Body.Bytes(), &response)
	s.NoError(err)

	s.Contains(response, "evaluation_id")
	s.Equal(false, response["conflicts_detected"])
	s.Equal(float64(80), response["completion_percentage"]) // 4/5 * 100
}

func (s *EvaluationHandlerTestSuite) TestSubmitEvaluation_ValidationError() {
	decisionID := "550e8400-e29b-41d4-a716-446655440002"

	// Invalid request - empty evaluations
	req := models.EvaluationRequest{
		Evaluations: []models.EvaluationScore{},
	}

	reqBody, _ := json.Marshal(req)
	request := httptest.NewRequest(http.MethodPost, "/decisions/"+decisionID+"/evaluations", bytes.NewBuffer(reqBody))
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

func (s *EvaluationHandlerTestSuite) TestGetEvaluationSummary_Success() {
	decisionID := "550e8400-e29b-41d4-a716-446655440002"

	// Mock aggregate results query
	rows := sqlmock.NewRows([]string{
		"option_id", "option_title", "avg_score", "score_variance", "avg_confidence", "evaluation_count",
	}).AddRow(
		"550e8400-e29b-41d4-a716-446655440003", "Full Refund", 7.5, 1.2, 4.0, 4,
	).AddRow(
		"550e8400-e29b-41d4-a716-446655440005", "Partial Refund", 6.2, 2.1, 3.5, 4,
	)

	s.Mock.ExpectQuery(regexp.QuoteMeta(`SELECT`)).
		WithArgs(decisionID).
		WillReturnRows(rows)

	request := httptest.NewRequest(http.MethodGet, "/decisions/"+decisionID+"/evaluation-summary", nil)
	recorder := httptest.NewRecorder()
	s.Router.ServeHTTP(recorder, request)

	// Assertions
	s.Equal(http.StatusOK, recorder.Code)

	var response map[string]interface{}
	err := json.Unmarshal(recorder.Body.Bytes(), &response)
	s.NoError(err)

	s.Equal(decisionID, response["decision_id"])
	s.Contains(response, "aggregate_results")

	results := response["aggregate_results"].([]interface{})
	s.Len(results, 2)

	firstResult := results[0].(map[string]interface{})
	s.Equal("Full Refund", firstResult["option_title"])
	s.Equal(7.5, firstResult["avg_score"])
}

func (s *EvaluationHandlerTestSuite) TestExportEvaluations_Success() {
	decisionID := "550e8400-e29b-41d4-a716-446655440002"

	// Mock decision title query
	s.Mock.ExpectQuery(regexp.QuoteMeta(`SELECT customer_name FROM customer_decisions WHERE id = $1`)).
		WithArgs(decisionID).
		WillReturnRows(sqlmock.NewRows([]string{"customer_name"}).AddRow("Acme Corp"))

	// Mock export data query
	rows := sqlmock.NewRows([]string{
		"option_title", "criterion_name", "score", "confidence", "rationale",
	}).AddRow(
		"Full Refund", "Customer Satisfaction", 8, 4, "High customer satisfaction expected",
	).AddRow(
		"Partial Refund", "Financial Impact", 6, 3, "Lower financial cost",
	)

	s.Mock.ExpectQuery(regexp.QuoteMeta(`SELECT`)).
		WithArgs(decisionID).
		WillReturnRows(rows)

	request := httptest.NewRequest(http.MethodGet, "/decisions/"+decisionID+"/export", nil)
	recorder := httptest.NewRecorder()
	s.Router.ServeHTTP(recorder, request)

	// Assertions
	s.Equal(http.StatusOK, recorder.Code)

	var response map[string]interface{}
	err := json.Unmarshal(recorder.Body.Bytes(), &response)
	s.NoError(err)

	s.Equal(decisionID, response["decision_id"])
	s.Equal("Acme Corp", response["decision_title"])
	s.Contains(response, "anonymous_data")

	data := response["anonymous_data"].([]interface{})
	s.Len(data, 2)
}

func (s *EvaluationHandlerTestSuite) TestExportEvaluations_InsufficientPermissions() {
	decisionID := "550e8400-e29b-41d4-a716-446655440002"

	// Override router with restricted role
	s.Router = gin.New()
	s.Router.Use(func(c *gin.Context) {
		claims := testutil.MockJWTClaims()
		claims.Role = "support_agent" // Restricted role
		c.Set("claims", claims)
		c.Next()
	})
	s.Router.GET("/decisions/:decisionId/export", s.Handler.ExportEvaluations)

	request := httptest.NewRequest(http.MethodGet, "/decisions/"+decisionID+"/export", nil)
	recorder := httptest.NewRecorder()
	s.Router.ServeHTTP(recorder, request)

	// Assertions
	s.Equal(http.StatusForbidden, recorder.Code)

	var response map[string]interface{}
	err := json.Unmarshal(recorder.Body.Bytes(), &response)
	s.NoError(err)

	s.Equal("forbidden", response["error"])
}

// Helper function for string pointers
func stringPtr(s string) *string {
	return &s
}

func TestEvaluationHandlerTestSuite(t *testing.T) {
	suite.Run(t, new(EvaluationHandlerTestSuite))
}
