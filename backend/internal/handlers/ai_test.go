package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"choseby-backend/internal/testutil"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/suite"
)

type AIHandlerTestSuite struct {
	testutil.TestSuite
	Handler *AIHandler
	Router  *gin.Engine
}

func (s *AIHandlerTestSuite) SetupTest() {
	s.TestSuite.SetupTest()

	// Initialize handler with API key
	s.Handler = NewAIHandler(s.DB, s.AuthService, "test-api-key")

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

	s.Router.POST("/ai/classify", s.Handler.ClassifyIssue)
	s.Router.POST("/ai/generate-options", s.Handler.GenerateOptions)
}

func (s *AIHandlerTestSuite) TestClassifyIssue_NoAPIKey() {
	// Test with handler that has no API key
	handlerNoKey := NewAIHandler(s.DB, s.AuthService, "")

	router := gin.New()
	router.Use(func(c *gin.Context) {
		claims := testutil.MockJWTClaims()
		c.Set("user_id", claims.UserID)
		c.Next()
	})
	router.POST("/ai/classify", handlerNoKey.ClassifyIssue)

	req := map[string]interface{}{
		"decisionId": "550e8400-e29b-41d4-a716-446655440001",
	}

	reqBody, _ := json.Marshal(req)
	request := httptest.NewRequest(http.MethodPost, "/ai/classify", bytes.NewBuffer(reqBody))
	request.Header.Set("Content-Type", "application/json")

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	// Assertions
	s.Equal(http.StatusServiceUnavailable, recorder.Code)

	var response map[string]interface{}
	err := json.Unmarshal(recorder.Body.Bytes(), &response)
	s.NoError(err)

	s.Equal("AI service not configured", response["error"])
}

func (s *AIHandlerTestSuite) TestClassifyIssue_NotAuthenticated() {
	// Test without authentication
	router := gin.New()
	router.POST("/ai/classify", s.Handler.ClassifyIssue)

	req := map[string]interface{}{
		"decisionId": "550e8400-e29b-41d4-a716-446655440001",
	}

	reqBody, _ := json.Marshal(req)
	request := httptest.NewRequest(http.MethodPost, "/ai/classify", bytes.NewBuffer(reqBody))
	request.Header.Set("Content-Type", "application/json")

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	// Assertions
	s.Equal(http.StatusUnauthorized, recorder.Code)

	var response map[string]interface{}
	err := json.Unmarshal(recorder.Body.Bytes(), &response)
	s.NoError(err)

	s.Equal("User not authenticated", response["error"])
}

func (s *AIHandlerTestSuite) TestClassifyIssue_ValidationError() {
	// Test with invalid request
	req := map[string]interface{}{
		"customer_context": map[string]interface{}{
			// Missing required fields
			"name": "Acme Corp",
		},
		// Missing issue_description and team_roles
	}

	reqBody, _ := json.Marshal(req)
	request := httptest.NewRequest(http.MethodPost, "/ai/classify", bytes.NewBuffer(reqBody))
	request.Header.Set("Content-Type", "application/json")

	recorder := httptest.NewRecorder()
	s.Router.ServeHTTP(recorder, request)

	// Assertions
	s.Equal(http.StatusBadRequest, recorder.Code)

	var response map[string]interface{}
	err := json.Unmarshal(recorder.Body.Bytes(), &response)
	s.NoError(err)

	s.Equal("Invalid request format", response["error"])
}

func (s *AIHandlerTestSuite) TestClassifyIssue_ValidRequest() {
	// Test with valid request - will return fallback since we can't mock external API
	req := map[string]interface{}{
		"decisionId": "550e8400-e29b-41d4-a716-446655440001",
	}

	reqBody, _ := json.Marshal(req)
	request := httptest.NewRequest(http.MethodPost, "/ai/classify", bytes.NewBuffer(reqBody))
	request.Header.Set("Content-Type", "application/json")

	recorder := httptest.NewRecorder()
	s.Router.ServeHTTP(recorder, request)

	// This should return 500 with fallback since we can't reach real DeepSeek API
	s.Equal(http.StatusInternalServerError, recorder.Code)

	var response map[string]interface{}
	err := json.Unmarshal(recorder.Body.Bytes(), &response)
	s.NoError(err)

	s.Equal("AI classification failed", response["error"])
	s.Contains(response, "fallback")

	// Verify fallback data structure
	fallback := response["fallback"].(map[string]interface{})
	s.Contains(fallback, "classification")
	s.Contains(fallback, "recommended_stakeholders")
	s.Contains(fallback, "suggested_criteria")
}

func (s *AIHandlerTestSuite) TestGenerateOptions_ValidRequest() {
	req := map[string]interface{}{
		"decision_context": map[string]interface{}{
			"customer_name":    "Acme Corp",
			"customer_tier":    "enterprise",
			"decision_type":    "refund_request",
			"description":      "Customer requesting full refund",
			"financial_impact": 5000.0,
		},
		"criteria": []map[string]interface{}{
			{
				"name":   "Customer Satisfaction",
				"weight": 1.5,
			},
			{
				"name":   "Financial Impact",
				"weight": 1.0,
			},
		},
	}

	reqBody, _ := json.Marshal(req)
	request := httptest.NewRequest(http.MethodPost, "/ai/generate-options", bytes.NewBuffer(reqBody))
	request.Header.Set("Content-Type", "application/json")

	recorder := httptest.NewRecorder()
	s.Router.ServeHTTP(recorder, request)

	// This should return 500 with fallback since we can't reach real DeepSeek API
	s.Equal(http.StatusInternalServerError, recorder.Code)

	var response map[string]interface{}
	err := json.Unmarshal(recorder.Body.Bytes(), &response)
	s.NoError(err)

	s.Equal("AI option generation failed", response["error"])
	s.Contains(response, "fallback")

	// Verify fallback options
	fallback := response["fallback"].([]interface{})
	s.Greater(len(fallback), 0)

	option := fallback[0].(map[string]interface{})
	s.Contains(option, "title")
	s.Contains(option, "description")
	s.Contains(option, "financial_cost")
	s.Contains(option, "implementation_effort")
	s.Contains(option, "risk_level")
}

func (s *AIHandlerTestSuite) TestGenerateOptions_NoAPIKey() {
	// Test with handler that has no API key
	handlerNoKey := NewAIHandler(s.DB, s.AuthService, "")

	router := gin.New()
	router.Use(func(c *gin.Context) {
		claims := testutil.MockJWTClaims()
		c.Set("user_id", claims.UserID)
		c.Next()
	})
	router.POST("/ai/generate-options", handlerNoKey.GenerateOptions)

	req := map[string]interface{}{
		"decision_context": map[string]interface{}{
			"customer_name":    "Acme Corp",
			"customer_tier":    "enterprise",
			"decision_type":    "refund_request",
			"description":      "Customer requesting full refund",
			"financial_impact": 5000.0,
		},
		"criteria": []map[string]interface{}{
			{
				"name":   "Customer Satisfaction",
				"weight": 1.5,
			},
		},
	}

	reqBody, _ := json.Marshal(req)
	request := httptest.NewRequest(http.MethodPost, "/ai/generate-options", bytes.NewBuffer(reqBody))
	request.Header.Set("Content-Type", "application/json")

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	// Assertions
	s.Equal(http.StatusServiceUnavailable, recorder.Code)

	var response map[string]interface{}
	err := json.Unmarshal(recorder.Body.Bytes(), &response)
	s.NoError(err)

	s.Equal("AI service not configured", response["error"])
}

func TestAIHandlerTestSuite(t *testing.T) {
	suite.Run(t, new(AIHandlerTestSuite))
}
