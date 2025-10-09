package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"testing"

	"choseby-backend/internal/models"
	"github.com/stretchr/testify/assert"
)

// TestScenario represents a test case for classification accuracy
type TestScenario struct {
	ID                     int             `json:"id"`
	Title                  string          `json:"title"`
	Description            string          `json:"description"`
	ExpectedClassification string          `json:"expected_classification"`
	ExpectedUrgency        int             `json:"expected_urgency"`
	Context                ScenarioContext `json:"context"`
}

// ScenarioContext provides customer context for the scenario
type ScenarioContext struct {
	CustomerTier   string  `json:"customer_tier"`
	CustomerValue  float64 `json:"customer_value"`
	PreviousIssues int     `json:"previous_issues"`
}

// ClassificationResult holds the result of a classification test
type ClassificationResult struct {
	ScenarioID      int     `json:"scenario_id"`
	Title           string  `json:"title"`
	Expected        string  `json:"expected_classification"`
	Actual          string  `json:"actual_classification"`
	Correct         bool    `json:"correct"`
	ConfidenceScore float64 `json:"confidence_score"`
	ExpectedUrgency int     `json:"expected_urgency"`
	ActualUrgency   int     `json:"actual_urgency"`
	UrgencyAccurate bool    `json:"urgency_accurate"`
}

// TestClassificationAccuracyWithRealScenarios validates AI classification against realistic customer scenarios
func TestClassificationAccuracyWithRealScenarios(t *testing.T) {
	// Load test scenarios
	scenarios, err := loadTestScenarios()
	assert.NoError(t, err, "Should load test scenarios")

	// Use local Ollama client (no API key needed)
	client := NewOllamaClient("deepseek-r1:7b")
	t.Logf("Using local Ollama model: deepseek-r1:7b")

	// Load available response types (mock data based on migration 001)
	responseTypes := getMockResponseTypes()

	// Run classification tests
	results := []ClassificationResult{}
	for _, scenario := range scenarios {
		t.Run(fmt.Sprintf("Scenario_%d_%s", scenario.ID, scenario.ExpectedClassification), func(t *testing.T) {
			// Call classification
			classification, err := client.ClassifyCustomerIssue(
				context.Background(),
				scenario.Title,
				scenario.Description,
				responseTypes,
			)
			if err != nil {
				t.Logf("WARNING: Classification failed for scenario %d: %v", scenario.ID, err)
				results = append(results, ClassificationResult{
					ScenarioID: scenario.ID,
					Title:      scenario.Title,
					Expected:   scenario.ExpectedClassification,
					Actual:     "ERROR",
					Correct:    false,
				})
				return
			}

			// Validate result (case-insensitive and trim whitespace for robustness)
			actualType := strings.TrimSpace(strings.ToLower(classification.DecisionType))
			expectedType := strings.TrimSpace(strings.ToLower(scenario.ExpectedClassification))
			correct := actualType == expectedType
			urgencyAccurate := abs(classification.UrgencyLevel-scenario.ExpectedUrgency) <= 1 // Allow ±1 for urgency

			result := ClassificationResult{
				ScenarioID:      scenario.ID,
				Title:           scenario.Title,
				Expected:        scenario.ExpectedClassification,
				Actual:          classification.DecisionType,
				Correct:         correct,
				ConfidenceScore: classification.ConfidenceScore,
				ExpectedUrgency: scenario.ExpectedUrgency,
				ActualUrgency:   classification.UrgencyLevel,
				UrgencyAccurate: urgencyAccurate,
			}
			results = append(results, result)

			t.Logf("Scenario %d: Expected=%s, Actual=%s, Confidence=%.2f, UrgencyExpected=%d, UrgencyActual=%d",
				scenario.ID,
				scenario.ExpectedClassification,
				classification.DecisionType,
				classification.ConfidenceScore,
				scenario.ExpectedUrgency,
				classification.UrgencyLevel,
			)
		})
	}

	// Calculate accuracy metrics
	totalTests := len(results)
	correctClassifications := 0
	correctUrgency := 0
	totalConfidence := 0.0

	for _, result := range results {
		if result.Correct {
			correctClassifications++
		}
		if result.UrgencyAccurate {
			correctUrgency++
		}
		totalConfidence += result.ConfidenceScore
	}

	classificationAccuracy := float64(correctClassifications) / float64(totalTests) * 100
	urgencyAccuracy := float64(correctUrgency) / float64(totalTests) * 100
	avgConfidence := totalConfidence / float64(totalTests)

	// Print summary report
	separator := "============================================================"
	t.Logf("\n%s", separator)
	t.Logf("CLASSIFICATION ACCURACY REPORT")
	t.Logf("%s", separator)
	t.Logf("Total Test Scenarios: %d", totalTests)
	t.Logf("Correct Classifications: %d/%d (%.1f%%)", correctClassifications, totalTests, classificationAccuracy)
	t.Logf("Correct Urgency Levels: %d/%d (%.1f%%)", correctUrgency, totalTests, urgencyAccuracy)
	t.Logf("Average Confidence Score: %.2f", avgConfidence)
	t.Logf("%s", separator)

	// Print detailed results
	t.Logf("\nDETAILED RESULTS:")
	for _, result := range results {
		status := "✓"
		if !result.Correct {
			status = "✗"
		}
		t.Logf("%s Scenario %d: %s → Expected: %s, Got: %s (Confidence: %.2f)",
			status,
			result.ScenarioID,
			result.Title,
			result.Expected,
			result.Actual,
			result.ConfidenceScore,
		)
	}

	// Save results to JSON for analysis
	resultsJSON, _ := json.MarshalIndent(results, "", "  ")
	_ = os.WriteFile("classification_test_results.json", resultsJSON, 0o600)
	t.Logf("\nResults saved to classification_test_results.json")

	// Assert accuracy meets Week 2 target: >85%
	assert.GreaterOrEqual(t, classificationAccuracy, 85.0,
		"Classification accuracy should be >= 85%% (Week 2 success criteria)")
}

// loadTestScenarios loads test scenarios from JSON file
func loadTestScenarios() ([]TestScenario, error) {
	data, err := os.ReadFile("test_scenarios.json")
	if err != nil {
		return nil, fmt.Errorf("failed to read test_scenarios.json: %w", err)
	}

	var scenarios []TestScenario
	if err := json.Unmarshal(data, &scenarios); err != nil {
		return nil, fmt.Errorf("failed to parse scenarios: %w", err)
	}

	return scenarios, nil
}

// getMockResponseTypes returns response types based on migration 001
func getMockResponseTypes() []models.CustomerResponseType {
	return []models.CustomerResponseType{
		{
			TypeCode:                 "refund_full",
			TypeName:                 "Full Refund Request",
			Description:              stringPtr("Customer requesting complete refund for product or service"),
			AIClassificationKeywords: []string{"refund", "money back", "full refund", "complete refund"},
			DefaultStakeholders:      []string{"customer_success_manager", "account_manager", "legal_compliance"},
		},
		{
			TypeCode:                 "refund_partial",
			TypeName:                 "Partial Refund Request",
			Description:              stringPtr("Customer requesting partial refund or credit"),
			AIClassificationKeywords: []string{"partial refund", "credit", "discount", "compensation"},
			DefaultStakeholders:      []string{"customer_success_manager", "support_manager"},
		},
		{
			TypeCode:                 "billing_dispute",
			TypeName:                 "Billing Dispute",
			Description:              stringPtr("Customer disputes billing charge or invoice"),
			AIClassificationKeywords: []string{"billing error", "wrong charge", "dispute invoice", "incorrect billing"},
			DefaultStakeholders:      []string{"account_manager", "legal_compliance"},
		},
		{
			TypeCode:                 "service_outage",
			TypeName:                 "Service Outage Response",
			Description:              stringPtr("Customer affected by service disruption or downtime"),
			AIClassificationKeywords: []string{"outage", "downtime", "service unavailable", "system down", "not working"},
			DefaultStakeholders:      []string{"customer_success_manager", "operations_manager"},
		},
		{
			TypeCode:                 "feature_request",
			TypeName:                 "Feature Request/Exception",
			Description:              stringPtr("Customer requesting feature or policy exception"),
			AIClassificationKeywords: []string{"feature", "exception", "special request", "custom requirement"},
			DefaultStakeholders:      []string{"customer_success_manager", "sales_manager"},
		},
		{
			TypeCode:                 "contract_change",
			TypeName:                 "Contract Modification",
			Description:              stringPtr("Customer requesting contract terms change"),
			AIClassificationKeywords: []string{"contract change", "terms modification", "agreement update", "pricing change"},
			DefaultStakeholders:      []string{"account_manager", "legal_compliance", "sales_manager"},
		},
		{
			TypeCode:                 "churn_risk",
			TypeName:                 "Churn Prevention",
			Description:              stringPtr("Customer expressing intent to cancel or downgrade"),
			AIClassificationKeywords: []string{"cancel", "downgrade", "not satisfied", "competitor", "leaving"},
			DefaultStakeholders:      []string{"customer_success_manager", "account_manager", "sales_manager"},
		},
		{
			TypeCode:                 "escalation",
			TypeName:                 "Customer Escalation",
			Description:              stringPtr("Customer requesting escalation to management"),
			AIClassificationKeywords: []string{"escalate", "manager", "supervisor", "urgent", "emergency"},
			DefaultStakeholders:      []string{"customer_success_manager", "account_manager", "operations_manager"},
		},
		{
			TypeCode:                 "data_privacy",
			TypeName:                 "Data Privacy Request",
			Description:              stringPtr("Customer data access, deletion, or privacy concern"),
			AIClassificationKeywords: []string{"privacy", "GDPR", "data deletion", "data access", "personal data"},
			DefaultStakeholders:      []string{"legal_compliance", "operations_manager"},
		},
		{
			TypeCode:                 "general_inquiry",
			TypeName:                 "General Inquiry",
			Description:              stringPtr("Standard customer inquiry or question"),
			AIClassificationKeywords: []string{"question", "inquiry", "how to", "information", "help"},
			DefaultStakeholders:      []string{"support_manager"},
		},
	}
}

// Helper functions

func stringPtr(s string) *string {
	return &s
}

func abs(x int) int {
	if x < 0 {
		return -x
	}
	return x
}
