//go:build integration
// +build integration

package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"choseby-backend/internal/api"
	"choseby-backend/internal/config"
	"choseby-backend/internal/database"

	"github.com/stretchr/testify/require"
)

// Performance benchmarks for critical customer response endpoints
// Target: <2 seconds response time for all endpoints

func BenchmarkDecisionCreation(b *testing.B) {
	server, authToken, cleanup := setupBenchmarkServer(b)
	defer cleanup()

	decisionReq := map[string]interface{}{
		"customer_name":                "Benchmark Customer",
		"customer_tier":                "enterprise",
		"customer_tier_detailed":       "platinum",
		"customer_value":               120000.00,
		"relationship_duration_months": 18,
		"urgency_level":                4,
		"urgency_level_detailed":       "high",
		"customer_impact_scope":        "company",
		"previous_issues_count":        2,
		"title":                        "Performance Test Decision",
		"description":                  "Testing decision creation performance",
		"decision_type":                "refund_request",
		"financial_impact":             10000.00,
	}

	body, _ := json.Marshal(decisionReq)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		req, _ := http.NewRequest("POST", server.URL+"/api/v1/decisions", bytes.NewBuffer(body))
		req.Header.Set("Authorization", "Bearer "+authToken)
		req.Header.Set("Content-Type", "application/json")

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			b.Fatal(err)
		}
		resp.Body.Close()

		if resp.StatusCode != http.StatusCreated {
			b.Fatalf("Expected 201, got %d", resp.StatusCode)
		}
	}
}

func BenchmarkDecisionListRetrieval(b *testing.B) {
	server, authToken, cleanup := setupBenchmarkServer(b)
	defer cleanup()

	// Pre-create some decisions for realistic testing
	createBenchmarkDecisions(b, server.URL, authToken, 20)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		req, _ := http.NewRequest("GET", server.URL+"/api/v1/decisions?limit=20", nil)
		req.Header.Set("Authorization", "Bearer "+authToken)

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			b.Fatal(err)
		}
		resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			b.Fatalf("Expected 200, got %d", resp.StatusCode)
		}
	}
}

func BenchmarkEvaluationSubmission(b *testing.B) {
	server, authToken, cleanup := setupBenchmarkServer(b)
	defer cleanup()

	// Setup: Create decision with criteria and options
	decisionID, optionID, criteriaID := setupBenchmarkDecision(b, server.URL, authToken)

	evalReq := map[string]interface{}{
		"evaluations": []map[string]interface{}{
			{
				"option_id":   optionID,
				"criteria_id": criteriaID,
				"score":       8,
				"confidence":  4,
			},
		},
	}

	body, _ := json.Marshal(evalReq)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		req, _ := http.NewRequest("POST", server.URL+"/api/v1/decisions/"+decisionID+"/evaluate", bytes.NewBuffer(body))
		req.Header.Set("Authorization", "Bearer "+authToken)
		req.Header.Set("Content-Type", "application/json")

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			b.Fatal(err)
		}
		resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			b.Fatalf("Expected 200, got %d", resp.StatusCode)
		}
	}
}

func BenchmarkEvaluationResults(b *testing.B) {
	server, authToken, cleanup := setupBenchmarkServer(b)
	defer cleanup()

	// Setup: Create decision with evaluations
	decisionID, optionID, criteriaID := setupBenchmarkDecision(b, server.URL, authToken)
	submitBenchmarkEvaluation(b, server.URL, authToken, decisionID, optionID, criteriaID)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		req, _ := http.NewRequest("GET", server.URL+"/api/v1/decisions/"+decisionID+"/results", nil)
		req.Header.Set("Authorization", "Bearer "+authToken)

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			b.Fatal(err)
		}
		resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			b.Fatalf("Expected 200, got %d", resp.StatusCode)
		}
	}
}

// TestResponseTimeRequirements validates <2s response time requirement
func TestResponseTimeRequirements(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping performance test in short mode")
	}

	server, authToken, cleanup := setupBenchmarkServer(t)
	defer cleanup()

	// Setup decision with full workflow
	decisionID, optionID, criteriaID := setupBenchmarkDecision(t, server.URL, authToken)
	submitBenchmarkEvaluation(t, server.URL, authToken, decisionID, optionID, criteriaID)

	tests := []struct {
		name            string
		method          string
		url             string
		body            map[string]interface{}
		maxResponseTime time.Duration
	}{
		{
			name:            "Decision Creation",
			method:          "POST",
			url:             "/api/v1/decisions",
			maxResponseTime: 2 * time.Second,
			body: map[string]interface{}{
				"customer_name":                "Response Time Test",
				"customer_tier":                "enterprise",
				"customer_tier_detailed":       "platinum",
				"customer_value":               120000.00,
				"relationship_duration_months": 18,
				"urgency_level":                4,
				"urgency_level_detailed":       "high",
				"customer_impact_scope":        "company",
				"previous_issues_count":        2,
				"title":                        "Response Time Test Decision",
				"description":                  "Testing response time requirements",
				"decision_type":                "refund_request",
				"financial_impact":             10000.00,
			},
		},
		{
			name:            "Decision List Retrieval",
			method:          "GET",
			url:             "/api/v1/decisions?limit=20",
			maxResponseTime: 1 * time.Second,
		},
		{
			name:            "Decision Detail Retrieval",
			method:          "GET",
			url:             "/api/v1/decisions/" + decisionID,
			maxResponseTime: 1 * time.Second,
		},
		{
			name:            "Evaluation Results",
			method:          "GET",
			url:             "/api/v1/decisions/" + decisionID + "/results",
			maxResponseTime: 2 * time.Second,
		},
		{
			name:            "Team Members List",
			method:          "GET",
			url:             "/api/v1/team/members",
			maxResponseTime: 1 * time.Second,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var req *http.Request
			var err error

			if tt.body != nil {
				body, _ := json.Marshal(tt.body)
				req, err = http.NewRequest(tt.method, server.URL+tt.url, bytes.NewBuffer(body))
			} else {
				req, err = http.NewRequest(tt.method, server.URL+tt.url, nil)
			}
			require.NoError(t, err)

			req.Header.Set("Authorization", "Bearer "+authToken)
			req.Header.Set("Content-Type", "application/json")

			start := time.Now()
			resp, err := http.DefaultClient.Do(req)
			duration := time.Since(start)

			require.NoError(t, err)
			defer resp.Body.Close()

			if duration > tt.maxResponseTime {
				t.Errorf("Response time %v exceeds maximum %v (%.1f%% over)",
					duration, tt.maxResponseTime,
					float64(duration-tt.maxResponseTime)/float64(tt.maxResponseTime)*100)
			} else {
				t.Logf("✓ Response time: %v (%.1f%% of max)", duration,
					float64(duration)/float64(tt.maxResponseTime)*100)
			}

			require.True(t, resp.StatusCode < 400, "Request should succeed (got %d)", resp.StatusCode)
		})
	}
}

// Helper functions for benchmark setup

func setupBenchmarkServer(tb testing.TB) (*httptest.Server, string, func()) {
	cfg := &config.Config{
		DatabaseURL:            getTestDatabaseURL(),
		JWTSecret:              "benchmark-secret-key",
		JWTExpiration:          1440,  // 24 hours in minutes
		RefreshTokenExpiration: 10080, // 7 days in minutes
		DeepSeekAPIKey:         "",
		CORSOrigins:            []string{"*"},
		APIRateLimit:           10000, // High limit for benchmarking
		APIRateWindow:          60,    // 1 minute in seconds
	}

	db, err := database.Initialize(cfg.DatabaseURL)
	if err != nil {
		tb.Fatalf("Failed to connect to test database: %v", err)
	}

	router := api.SetupRouter(db, cfg)
	server := httptest.NewServer(router)

	// Register test user
	registerReq := map[string]interface{}{
		"email":     fmt.Sprintf("bench-%d@test.com", time.Now().UnixNano()),
		"name":      "Benchmark User",
		"password":  "BenchPass123!",
		"team_name": "Benchmark Team",
		"company":   "Benchmark Corp",
		"role":      "customer_success_manager",
	}

	body, _ := json.Marshal(registerReq)
	resp, err := http.Post(server.URL+"/api/v1/auth/register", "application/json", bytes.NewBuffer(body))
	if err != nil {
		tb.Fatalf("Failed to register: %v", err)
	}
	defer resp.Body.Close()

	var authResp map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&authResp)
	authToken := authResp["token"].(string)

	cleanup := func() {
		server.Close()
		db.Close()
	}

	return server, authToken, cleanup
}

func createBenchmarkDecisions(tb testing.TB, serverURL, authToken string, count int) {
	for i := 0; i < count; i++ {
		decisionReq := map[string]interface{}{
			"customer_name":                fmt.Sprintf("Customer %d", i),
			"customer_tier":                "enterprise",
			"customer_tier_detailed":       "platinum",
			"customer_value":               120000.00,
			"relationship_duration_months": 18,
			"urgency_level":                4,
			"urgency_level_detailed":       "high",
			"customer_impact_scope":        "company",
			"previous_issues_count":        2,
			"title":                        fmt.Sprintf("Decision %d", i),
			"description":                  "Benchmark decision",
			"decision_type":                "refund_request",
			"financial_impact":             10000.00,
		}

		body, _ := json.Marshal(decisionReq)
		req, _ := http.NewRequest("POST", serverURL+"/api/v1/decisions", bytes.NewBuffer(body))
		req.Header.Set("Authorization", "Bearer "+authToken)
		req.Header.Set("Content-Type", "application/json")

		resp, _ := http.DefaultClient.Do(req)
		resp.Body.Close()
	}
}

func setupBenchmarkDecision(tb testing.TB, serverURL, authToken string) (decisionID, optionID, criteriaID string) {
	// Create decision
	decisionReq := map[string]interface{}{
		"customer_name":                "Benchmark Decision",
		"customer_tier":                "enterprise",
		"customer_tier_detailed":       "platinum",
		"customer_value":               120000.00,
		"relationship_duration_months": 18,
		"urgency_level":                4,
		"urgency_level_detailed":       "high",
		"customer_impact_scope":        "company",
		"previous_issues_count":        2,
		"title":                        "Benchmark Test",
		"description":                  "Performance testing decision",
		"decision_type":                "refund_request",
		"financial_impact":             10000.00,
	}

	body, _ := json.Marshal(decisionReq)
	req, _ := http.NewRequest("POST", serverURL+"/api/v1/decisions", bytes.NewBuffer(body))
	req.Header.Set("Authorization", "Bearer "+authToken)
	req.Header.Set("Content-Type", "application/json")

	resp, _ := http.DefaultClient.Do(req)
	var decisionResp map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&decisionResp)
	resp.Body.Close()

	decisionID = decisionResp["id"].(string)

	// Add criteria
	criteriaReq := map[string]interface{}{
		"criteria": []map[string]interface{}{
			{
				"name":        "Customer Satisfaction",
				"description": "Impact on customer happiness",
				"weight":      1.5,
			},
		},
	}

	body, _ = json.Marshal(criteriaReq)
	req, _ = http.NewRequest("PUT", serverURL+"/api/v1/decisions/"+decisionID+"/criteria", bytes.NewBuffer(body))
	req.Header.Set("Authorization", "Bearer "+authToken)
	req.Header.Set("Content-Type", "application/json")

	resp, _ = http.DefaultClient.Do(req)
	var criteriaResp map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&criteriaResp)
	resp.Body.Close()

	criteria := criteriaResp["criteria"].([]interface{})
	criteriaID = criteria[0].(map[string]interface{})["id"].(string)

	// Add options
	optionsReq := map[string]interface{}{
		"options": []map[string]interface{}{
			{
				"title":                 "Full Refund",
				"description":           "Complete refund",
				"financial_cost":        10000.00,
				"implementation_effort": "low",
				"risk_level":            "medium",
			},
		},
	}

	body, _ = json.Marshal(optionsReq)
	req, _ = http.NewRequest("PUT", serverURL+"/api/v1/decisions/"+decisionID+"/options", bytes.NewBuffer(body))
	req.Header.Set("Authorization", "Bearer "+authToken)
	req.Header.Set("Content-Type", "application/json")

	resp, _ = http.DefaultClient.Do(req)
	var optionsResp map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&optionsResp)
	resp.Body.Close()

	options := optionsResp["options"].([]interface{})
	optionID = options[0].(map[string]interface{})["id"].(string)

	return decisionID, optionID, criteriaID
}

func submitBenchmarkEvaluation(tb testing.TB, serverURL, authToken, decisionID, optionID, criteriaID string) {
	evalReq := map[string]interface{}{
		"evaluations": []map[string]interface{}{
			{
				"option_id":   optionID,
				"criteria_id": criteriaID,
				"score":       8,
				"confidence":  4,
			},
		},
	}

	body, _ := json.Marshal(evalReq)
	req, _ := http.NewRequest("POST", serverURL+"/api/v1/decisions/"+decisionID+"/evaluate", bytes.NewBuffer(body))
	req.Header.Set("Authorization", "Bearer "+authToken)
	req.Header.Set("Content-Type", "application/json")

	resp, _ := http.DefaultClient.Do(req)
	resp.Body.Close()
}
