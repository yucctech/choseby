package ai

import (
	"context"
	"fmt"

	"choseby-backend/internal/database"
	"choseby-backend/internal/models"
)

// AIService provides AI-powered customer response intelligence
type AIService struct {
	deepseek *DeepSeekClient
	db       *database.DB
}

// NewAIService creates a new AI service
func NewAIService(apiKey string, db *database.DB) *AIService {
	config := DeepSeekConfig{
		APIKey:            apiKey,
		MaxRequestsPerMin: 60,
	}

	return &AIService{
		deepseek: NewDeepSeekClient(config),
		db:       db,
	}
}

// ClassifyDecision analyzes a customer decision and provides AI classification
func (s *AIService) ClassifyDecision(ctx context.Context, decision *models.CustomerDecision) error {
	// Get available response types from database
	var responseTypes []models.CustomerResponseType
	err := s.db.SelectContext(ctx, &responseTypes, `
		SELECT id, type_code, type_name, description, typical_resolution_time_hours,
		       requires_escalation, default_stakeholders, ai_classification_keywords
		FROM customer_response_types
		ORDER BY type_name
	`)
	if err != nil {
		return fmt.Errorf("failed to fetch response types: %w", err)
	}

	// Classify the issue using DeepSeek AI
	classification, err := s.deepseek.ClassifyCustomerIssue(ctx, decision.Title, decision.Description, responseTypes)
	if err != nil {
		return fmt.Errorf("AI classification failed: %w", err)
	}

	// Find matching response type
	var matchedType *models.CustomerResponseType
	for i := range responseTypes {
		if responseTypes[i].TypeCode == classification.DecisionType {
			matchedType = &responseTypes[i]
			break
		}
	}

	// Get stakeholder recommendations
	recommendations, err := s.deepseek.RecommendStakeholders(ctx, *decision, matchedType)
	if err != nil {
		return fmt.Errorf("stakeholder recommendation failed: %w", err)
	}

	// Update decision with AI analysis
	decision.AIClassification = classification
	decision.AIRecommendations = recommendations
	confidenceScore := classification.ConfidenceScore
	decision.AIConfidenceScore = &confidenceScore

	return nil
}

// EnhanceDecisionWithAI adds AI analysis to an existing decision
func (s *AIService) EnhanceDecisionWithAI(ctx context.Context, decisionID string) (*models.AIClassification, *models.AIRecommendations, error) {
	// Get decision from database
	var decision models.CustomerDecision
	err := s.db.GetContext(ctx, &decision, `
		SELECT * FROM customer_decisions WHERE id = $1
	`, decisionID)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to fetch decision: %w", err)
	}

	// Classify the decision
	if err := s.ClassifyDecision(ctx, &decision); err != nil {
		return nil, nil, err
	}

	// Update decision in database with AI analysis
	_, err = s.db.NamedExecContext(ctx, `
		UPDATE customer_decisions
		SET ai_classification = :ai_classification,
		    ai_recommendations = :ai_recommendations,
		    ai_confidence_score = :ai_confidence_score,
		    updated_at = NOW()
		WHERE id = :id
	`, decision)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to update decision: %w", err)
	}

	return decision.AIClassification, decision.AIRecommendations, nil
}

// SuggestResponseOptions generates AI-suggested response options
func (s *AIService) SuggestResponseOptions(ctx context.Context, decision models.CustomerDecision) ([]models.ResponseOption, error) {
	// This is a placeholder for future AI-generated response options
	// For now, return empty array to indicate no AI-generated options
	return []models.ResponseOption{}, nil
}

// GenerateResponseDraft creates an AI-powered customer response draft
func (s *AIService) GenerateResponseDraft(ctx context.Context, req ResponseDraftRequest) (*ResponseDraft, error) {
	return s.deepseek.GenerateResponseDraft(ctx, req)
}

// ValidateClassificationAccuracy checks if AI classification matches actual outcome
func (s *AIService) ValidateClassificationAccuracy(ctx context.Context, decisionID string, actualType string) (bool, error) {
	// Get decision with AI classification
	var decision models.CustomerDecision
	err := s.db.GetContext(ctx, &decision, `
		SELECT ai_classification FROM customer_decisions WHERE id = $1
	`, decisionID)
	if err != nil {
		return false, fmt.Errorf("failed to fetch decision: %w", err)
	}

	if decision.AIClassification == nil {
		return false, fmt.Errorf("no AI classification found")
	}

	// Compare AI classification with actual type
	isAccurate := decision.AIClassification.DecisionType == actualType

	// Record accuracy in outcome_tracking if outcome exists
	_, err = s.db.ExecContext(ctx, `
		UPDATE outcome_tracking
		SET ai_classification_accurate = $1
		WHERE decision_id = $2
	`, isAccurate, decisionID)
	// Ignore error if outcome tracking doesn't exist yet

	return isAccurate, nil
}
