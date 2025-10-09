package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

// TestModelScopeClassificationAccuracy validates ModelScope Qwen classification against realistic scenarios
func TestModelScopeClassificationAccuracy(t *testing.T) {
	// Get ModelScope API token from environment
	apiToken := os.Getenv("MODELSCOPE_API_TOKEN")
	if apiToken == "" {
		t.Skip("MODELSCOPE_API_TOKEN not set - skipping ModelScope tests")
	}

	// Load test scenarios
	scenarios, err := loadTestScenarios()
	assert.NoError(t, err, "Should load test scenarios")

	// Create ModelScope client with Qwen model
	client := NewModelScopeClient(ModelScopeConfig{
		APIKey: apiToken,
		Model:  "qwen-max", // Using Qwen Max for best accuracy
	})
	t.Logf("Using ModelScope API with model: qwen-max")
	t.Logf("Base URL: https://api-inference.modelscope.cn/v1")
	t.Logf("Free tier: 2000 calls/day")

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
	t.Logf("MODELSCOPE (QWEN-MAX) CLASSIFICATION ACCURACY REPORT")
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

	// Save results to JSON for comparison with other models
	resultsJSON, _ := json.MarshalIndent(results, "", "  ")
	_ = os.WriteFile("modelscope_test_results.json", resultsJSON, 0600)
	t.Logf("\nResults saved to modelscope_test_results.json")

	// Print comparison with other models
	t.Logf("\n%s", separator)
	t.Logf("MODEL COMPARISON")
	t.Logf("%s", separator)
	t.Logf("DeepSeek R1 7B (local):  80%% accuracy, $0/month")
	t.Logf("ModelScope Qwen Max:     %.1f%% accuracy, $0/month (2000 calls/day free)", classificationAccuracy)
	t.Logf("%s", separator)

	// Assert accuracy meets Week 2 target: >85%
	assert.GreaterOrEqual(t, classificationAccuracy, 85.0,
		"Classification accuracy should be >= 85%% (Week 2 success criteria)")
}
