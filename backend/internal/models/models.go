package models

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// Team represents a customer response team
type Team struct {
	ID               uuid.UUID `json:"id" db:"id"`
	Name             string    `json:"name" db:"name"`
	CompanyName      string    `json:"company_name" db:"company_name"`
	Industry         *string   `json:"industry,omitempty" db:"industry"`
	TeamSize         int       `json:"team_size" db:"team_size"`
	SubscriptionTier string    `json:"subscription_tier" db:"subscription_tier"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time `json:"updated_at" db:"updated_at"`
}

// TeamMember represents a customer response team member
type TeamMember struct {
	ID                      uuid.UUID         `json:"id" db:"id"`
	TeamID                  uuid.UUID         `json:"team_id" db:"team_id"`
	Email                   string            `json:"email" db:"email"`
	Name                    string            `json:"name" db:"name"`
	PasswordHash            string            `json:"-" db:"password_hash"`
	Role                    string            `json:"role" db:"role"`
	ExpertiseAreas          []string          `json:"expertise_areas,omitempty" db:"expertise_areas"`
	EscalationAuthority     int               `json:"escalation_authority" db:"escalation_authority"`
	NotificationPreferences NotificationPrefs `json:"notification_preferences" db:"notification_preferences"`
	IsActive                bool              `json:"is_active" db:"is_active"`
	CreatedAt               time.Time         `json:"created_at" db:"created_at"`
	UpdatedAt               time.Time         `json:"updated_at" db:"updated_at"`
}

// NotificationPrefs represents notification preferences
type NotificationPrefs struct {
	Email bool `json:"email"`
	SMS   bool `json:"sms"`
	Push  bool `json:"push"`
}

// Value implements driver.Valuer interface for database storage
func (n NotificationPrefs) Value() (driver.Value, error) {
	return json.Marshal(n)
}

// Scan implements sql.Scanner interface for database retrieval
func (n *NotificationPrefs) Scan(value interface{}) error {
	if value == nil {
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("cannot scan %T into NotificationPrefs", value)
	}

	return json.Unmarshal(bytes, n)
}

// CustomerDecision represents a customer response decision
type CustomerDecision struct {
	ID        uuid.UUID `json:"id" db:"id"`
	TeamID    uuid.UUID `json:"team_id" db:"team_id"`
	CreatedBy uuid.UUID `json:"created_by" db:"created_by"`

	// Customer Context
	CustomerName               string   `json:"customer_name" db:"customer_name"`
	CustomerID                 *string  `json:"customer_id,omitempty" db:"customer_id"`
	CustomerEmail              *string  `json:"customer_email,omitempty" db:"customer_email"`
	CustomerTier               string   `json:"customer_tier" db:"customer_tier"`
	CustomerValue              *float64 `json:"customer_value,omitempty" db:"customer_value"`
	RelationshipDurationMonths int      `json:"relationship_duration_months" db:"relationship_duration_months"`

	// Enhanced Customer Context (Week 1 Migration)
	CustomerTierDetailed string     `json:"customer_tier_detailed" db:"customer_tier_detailed"`
	UrgencyLevelDetailed string     `json:"urgency_level_detailed" db:"urgency_level_detailed"`
	CustomerImpactScope  string     `json:"customer_impact_scope" db:"customer_impact_scope"`
	RelationshipHistory  *string    `json:"relationship_history,omitempty" db:"relationship_history"`
	PreviousIssuesCount  int        `json:"previous_issues_count" db:"previous_issues_count"`
	LastInteractionDate  *time.Time `json:"last_interaction_date,omitempty" db:"last_interaction_date"`
	NPSScore             *int       `json:"nps_score,omitempty" db:"nps_score"`

	// Decision Details
	Title           string   `json:"title" db:"title"`
	Description     string   `json:"description" db:"description"`
	DecisionType    string   `json:"decision_type" db:"decision_type"`
	UrgencyLevel    int      `json:"urgency_level" db:"urgency_level"`
	FinancialImpact *float64 `json:"financial_impact,omitempty" db:"financial_impact"`

	// Workflow Status
	Status                 string     `json:"status" db:"status"`
	CurrentPhase           int        `json:"current_phase" db:"current_phase"`
	ExpectedResolutionDate *time.Time `json:"expected_resolution_date,omitempty" db:"expected_resolution_date"`
	ActualResolutionDate   *time.Time `json:"actual_resolution_date,omitempty" db:"actual_resolution_date"`

	// AI Analysis
	AIClassification  *AIClassification  `json:"ai_classification,omitempty" db:"ai_classification"`
	AIRecommendations *AIRecommendations `json:"ai_recommendations,omitempty" db:"ai_recommendations"`
	AIConfidenceScore *float64           `json:"ai_confidence_score,omitempty" db:"ai_confidence_score"`

	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// AIClassification represents AI analysis of customer issue
type AIClassification struct {
	DecisionType    string   `json:"decision_type"`
	UrgencyLevel    int      `json:"urgency_level"`
	ConfidenceScore float64  `json:"confidence_score"`
	RiskFactors     []string `json:"risk_factors"`
}

// Value implements driver.Valuer interface
func (a AIClassification) Value() (driver.Value, error) {
	return json.Marshal(a)
}

// Scan implements sql.Scanner interface
func (a *AIClassification) Scan(value interface{}) error {
	if value == nil {
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("cannot scan %T into AIClassification", value)
	}

	return json.Unmarshal(bytes, a)
}

// AIRecommendations represents AI-generated recommendations
type AIRecommendations struct {
	RecommendedStakeholders []RecommendedStakeholder `json:"recommended_stakeholders"`
	SuggestedCriteria       []SuggestedCriterion     `json:"suggested_criteria"`
}

type RecommendedStakeholder struct {
	Role      string  `json:"role"`
	Weight    float64 `json:"weight"`
	Reasoning string  `json:"reasoning"`
}

type SuggestedCriterion struct {
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Weight      float64 `json:"weight"`
}

// Value implements driver.Valuer interface
func (a AIRecommendations) Value() (driver.Value, error) {
	return json.Marshal(a)
}

// Scan implements sql.Scanner interface
func (a *AIRecommendations) Scan(value interface{}) error {
	if value == nil {
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("cannot scan %T into AIRecommendations", value)
	}

	return json.Unmarshal(bytes, a)
}

// DecisionCriterion represents evaluation criteria
type DecisionCriterion struct {
	ID          uuid.UUID `json:"id" db:"id"`
	DecisionID  uuid.UUID `json:"decision_id" db:"decision_id"`
	Name        string    `json:"name" db:"name"`
	Description *string   `json:"description,omitempty" db:"description"`
	Weight      float64   `json:"weight" db:"weight"`
	CreatedBy   uuid.UUID `json:"created_by" db:"created_by"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

// ResponseOption represents a customer response option
type ResponseOption struct {
	ID                   uuid.UUID  `json:"id" db:"id"`
	DecisionID           uuid.UUID  `json:"decision_id" db:"decision_id"`
	Title                string     `json:"title" db:"title"`
	Description          string     `json:"description" db:"description"`
	FinancialCost        float64    `json:"financial_cost" db:"financial_cost"`
	ImplementationEffort string     `json:"implementation_effort" db:"implementation_effort"`
	RiskLevel            string     `json:"risk_level" db:"risk_level"`
	AIGenerated          bool       `json:"ai_generated" db:"ai_generated"`
	CreatedBy            *uuid.UUID `json:"created_by,omitempty" db:"created_by"`
	CreatedAt            time.Time  `json:"created_at" db:"created_at"`
}

// Evaluation represents team member evaluation
type Evaluation struct {
	ID               uuid.UUID `json:"id" db:"id"`
	DecisionID       uuid.UUID `json:"decision_id" db:"decision_id"`
	EvaluatorID      uuid.UUID `json:"evaluator_id" db:"evaluator_id"`
	OptionID         uuid.UUID `json:"option_id" db:"option_id"`
	CriteriaID       uuid.UUID `json:"criteria_id" db:"criteria_id"`
	Score            int       `json:"score" db:"score"`
	Confidence       int       `json:"confidence" db:"confidence"`
	AnonymousComment *string   `json:"anonymous_comment,omitempty" db:"anonymous_comment"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
}

// DecisionOutcome represents the result and customer satisfaction
type DecisionOutcome struct {
	ID                        uuid.UUID  `json:"id" db:"id"`
	DecisionID                uuid.UUID  `json:"decision_id" db:"decision_id"`
	SelectedOptionID          uuid.UUID  `json:"selected_option_id" db:"selected_option_id"`
	ResponseSentAt            *time.Time `json:"response_sent_at,omitempty" db:"response_sent_at"`
	CustomerSatisfactionScore *int       `json:"customer_satisfaction_score,omitempty" db:"customer_satisfaction_score"`
	EscalationOccurred        bool       `json:"escalation_occurred" db:"escalation_occurred"`
	ResolutionTimeHours       *int       `json:"resolution_time_hours,omitempty" db:"resolution_time_hours"`
	FollowUpRequired          bool       `json:"follow_up_required" db:"follow_up_required"`
	FollowUpDate              *time.Time `json:"follow_up_date,omitempty" db:"follow_up_date"`
	OutcomeNotes              *string    `json:"outcome_notes,omitempty" db:"outcome_notes"`
	FinancialImpactActual     *float64   `json:"financial_impact_actual,omitempty" db:"financial_impact_actual"`
	CustomerRetained          *bool      `json:"customer_retained,omitempty" db:"customer_retained"`
	CreatedAt                 time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt                 time.Time  `json:"updated_at" db:"updated_at"`
}

// AuthToken represents authentication tokens
type AuthToken struct {
	ID        uuid.UUID `json:"id" db:"id"`
	UserID    uuid.UUID `json:"user_id" db:"user_id"`
	TokenHash string    `json:"-" db:"token_hash"`
	ExpiresAt time.Time `json:"expires_at" db:"expires_at"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// AuditLog represents system audit trail
type AuditLog struct {
	ID         uuid.UUID   `json:"id" db:"id"`
	DecisionID *uuid.UUID  `json:"decision_id,omitempty" db:"decision_id"`
	UserID     *uuid.UUID  `json:"user_id,omitempty" db:"user_id"`
	Action     string      `json:"action" db:"action"`
	Details    interface{} `json:"details,omitempty" db:"details"`
	IPAddress  *string     `json:"ip_address,omitempty" db:"ip_address"`
	UserAgent  *string     `json:"user_agent,omitempty" db:"user_agent"`
	CreatedAt  time.Time   `json:"created_at" db:"created_at"`
}

// Request/Response DTOs for API

// RegisterRequest represents team registration request
type RegisterRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Name     string `json:"name" validate:"required"`
	Password string `json:"password" validate:"required,min=8"`
	TeamName string `json:"team_name" validate:"required"`
	Company  string `json:"company" validate:"required"`
	Role     string `json:"role" validate:"required"`
}

// LoginRequest represents login request
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// AuthResponse represents authentication response
type AuthResponse struct {
	Token     string     `json:"token"`
	User      TeamMember `json:"user"`
	Team      Team       `json:"team"`
	ExpiresAt time.Time  `json:"expires_at"`
}

// CreateDecisionRequest represents decision creation request
type CreateDecisionRequest struct {
	CustomerName               string   `json:"customer_name" validate:"required"`
	CustomerEmail              *string  `json:"customer_email,omitempty"`
	CustomerTier               string   `json:"customer_tier" validate:"required"`
	CustomerValue              *float64 `json:"customer_value,omitempty"`
	RelationshipDurationMonths int      `json:"relationship_duration_months"`

	// Enhanced Customer Context (Week 1 Migration)
	CustomerTierDetailed string     `json:"customer_tier_detailed,omitempty"`
	UrgencyLevelDetailed string     `json:"urgency_level_detailed,omitempty"`
	CustomerImpactScope  string     `json:"customer_impact_scope,omitempty"`
	RelationshipHistory  *string    `json:"relationship_history,omitempty"`
	PreviousIssuesCount  int        `json:"previous_issues_count,omitempty"`
	LastInteractionDate  *time.Time `json:"last_interaction_date,omitempty"`
	NPSScore             *int       `json:"nps_score,omitempty"`

	Title                  string     `json:"title" validate:"required"`
	Description            string     `json:"description" validate:"required"`
	DecisionType           string     `json:"decision_type" validate:"required"`
	UrgencyLevel           int        `json:"urgency_level" validate:"min=1,max=5"`
	FinancialImpact        *float64   `json:"financial_impact,omitempty"`
	ExpectedResolutionDate *time.Time `json:"expected_resolution_date,omitempty"`
}

// EvaluationRequest represents evaluation submission
type EvaluationRequest struct {
	Evaluations []EvaluationScore `json:"evaluations" validate:"required,dive"`
}

type EvaluationScore struct {
	OptionID   uuid.UUID `json:"option_id" validate:"required"`
	CriteriaID uuid.UUID `json:"criteria_id" validate:"required"`
	Score      int       `json:"score" validate:"min=1,max=10"`
	Confidence int       `json:"confidence" validate:"min=1,max=5"`
	Comment    *string   `json:"comment,omitempty"`
}

// EvaluationResults represents analysis results
type EvaluationResults struct {
	OptionScores      []OptionScore `json:"option_scores"`
	ParticipationRate float64       `json:"participation_rate"`
	CompletedBy       []string      `json:"completed_by"`
	PendingFrom       []string      `json:"pending_from"`
	RecommendedOption *uuid.UUID    `json:"recommended_option,omitempty"`
	TeamConsensus     float64       `json:"team_consensus"`
}

type OptionScore struct {
	OptionID      uuid.UUID `json:"option_id"`
	OptionTitle   string    `json:"option_title"`
	AverageScore  float64   `json:"average_score"`
	WeightedScore float64   `json:"weighted_score"`
	Evaluators    int       `json:"evaluators"`
	Consensus     float64   `json:"consensus"`
	ConflictLevel string    `json:"conflict_level"`
}

// CustomerResponseType represents lookup table for response types
type CustomerResponseType struct {
	ID                         uuid.UUID `json:"id" db:"id"`
	TypeCode                   string    `json:"type_code" db:"type_code"`
	TypeName                   string    `json:"type_name" db:"type_name"`
	Description                *string   `json:"description,omitempty" db:"description"`
	TypicalResolutionTimeHours *int      `json:"typical_resolution_time_hours,omitempty" db:"typical_resolution_time_hours"`
	RequiresEscalation         bool      `json:"requires_escalation" db:"requires_escalation"`
	DefaultStakeholders        []string  `json:"default_stakeholders,omitempty" db:"default_stakeholders"`
	AIClassificationKeywords   []string  `json:"ai_classification_keywords,omitempty" db:"ai_classification_keywords"`
	CreatedAt                  time.Time `json:"created_at" db:"created_at"`
	UpdatedAt                  time.Time `json:"updated_at" db:"updated_at"`
}

// ResponseDraft represents AI-generated customer response with versioning
type ResponseDraft struct {
	ID                          uuid.UUID  `json:"id" db:"id"`
	DecisionID                  uuid.UUID  `json:"decision_id" db:"decision_id"`
	DraftContent                string     `json:"draft_content" db:"draft_content"`
	Tone                        string     `json:"tone" db:"tone"`
	KeyPoints                   []string   `json:"key_points" db:"key_points"`
	EstimatedSatisfactionImpact *string    `json:"estimated_satisfaction_impact,omitempty" db:"estimated_satisfaction_impact"`
	FollowUpRecommendations     []string   `json:"follow_up_recommendations" db:"follow_up_recommendations"`
	Version                     int        `json:"version" db:"version"`
	CreatedBy                   uuid.UUID  `json:"created_by" db:"created_by"`
	CreatedAt                   time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt                   time.Time  `json:"updated_at" db:"updated_at"`
	GenerationMetadata          *string    `json:"generation_metadata,omitempty" db:"generation_metadata"`
	BasedOnOptionID             *uuid.UUID `json:"based_on_option_id,omitempty" db:"based_on_option_id"`
	TeamConsensusScore          *float64   `json:"team_consensus_score,omitempty" db:"team_consensus_score"`
}

// GenerateResponseDraftRequest represents request to generate customer response draft
type GenerateResponseDraftRequest struct {
	DecisionOutcome          DecisionOutcomeInput          `json:"decision_outcome" validate:"required"`
	CommunicationPreferences CommunicationPreferencesInput `json:"communication_preferences" validate:"required"`
	RegenerateFromVersion    *int                          `json:"regenerate_from_version,omitempty"`
}

// DecisionOutcomeInput represents the team's decision
type DecisionOutcomeInput struct {
	SelectedOptionID string `json:"selected_option_id" validate:"required"`
	Reasoning        string `json:"reasoning" validate:"required"`
}

// CommunicationPreferencesInput specifies tone and channel
type CommunicationPreferencesInput struct {
	Tone    string `json:"tone" validate:"required,oneof=professional_empathetic formal_corporate friendly_apologetic concise_factual"`
	Channel string `json:"channel" validate:"required,oneof=email phone chat meeting"`
	Urgency string `json:"urgency" validate:"required,oneof=same_day next_day weekly"`
}

// OutcomeTracking represents comprehensive outcome tracking
type OutcomeTracking struct {
	ID         uuid.UUID  `json:"id" db:"id"`
	DecisionID uuid.UUID  `json:"decision_id" db:"decision_id"`
	OutcomeID  *uuid.UUID `json:"outcome_id,omitempty" db:"outcome_id"`

	// Response Time Metrics
	DecisionCreatedAt        time.Time  `json:"decision_created_at" db:"decision_created_at"`
	FirstResponseAt          *time.Time `json:"first_response_at,omitempty" db:"first_response_at"`
	ResolutionAt             *time.Time `json:"resolution_at,omitempty" db:"resolution_at"`
	TimeToFirstResponseHours *float64   `json:"time_to_first_response_hours,omitempty" db:"time_to_first_response_hours"`
	TimeToResolutionHours    *float64   `json:"time_to_resolution_hours,omitempty" db:"time_to_resolution_hours"`

	// Customer Satisfaction Metrics
	CustomerSatisfactionScore *int  `json:"customer_satisfaction_score,omitempty" db:"customer_satisfaction_score"`
	NPSChange                 *int  `json:"nps_change,omitempty" db:"nps_change"`
	CustomerRetained          *bool `json:"customer_retained,omitempty" db:"customer_retained"`
	EscalationOccurred        bool  `json:"escalation_occurred" db:"escalation_occurred"`

	// Decision Quality Metrics
	TeamConsensusScore        *float64 `json:"team_consensus_score,omitempty" db:"team_consensus_score"`
	AIAccuracyValidation      *bool    `json:"ai_accuracy_validation,omitempty" db:"ai_accuracy_validation"`
	OptionEffectivenessRating *int     `json:"option_effectiveness_rating,omitempty" db:"option_effectiveness_rating"`

	// Learning Data
	WhatWorkedWell   *string `json:"what_worked_well,omitempty" db:"what_worked_well"`
	WhatCouldImprove *string `json:"what_could_improve,omitempty" db:"what_could_improve"`
	LessonsLearned   *string `json:"lessons_learned,omitempty" db:"lessons_learned"`

	// Financial Impact
	EstimatedFinancialImpact *float64 `json:"estimated_financial_impact,omitempty" db:"estimated_financial_impact"`
	ActualFinancialImpact    *float64 `json:"actual_financial_impact,omitempty" db:"actual_financial_impact"`
	ROIRatio                 *float64 `json:"roi_ratio,omitempty" db:"roi_ratio"`

	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// Analytics DTOs
type DashboardAnalytics struct {
	Period                     string         `json:"period"`
	TotalDecisions             int            `json:"total_decisions"`
	AverageResolutionTimeHours float64        `json:"average_resolution_time_hours"`
	CustomerSatisfactionAvg    float64        `json:"customer_satisfaction_avg"`
	DecisionTypes              map[string]int `json:"decision_types"`
	UrgencyBreakdown           map[string]int `json:"urgency_breakdown"`
}
