package models

import (
	"time"

	"github.com/google/uuid"
)

// User represents a team member
type User struct {
	ID           uuid.UUID  `json:"id" db:"id"`
	Email        string     `json:"email" db:"email"`
	Name         string     `json:"name" db:"name"`
	Role         string     `json:"role" db:"role"` // admin, team_admin, member, viewer
	Department   *string    `json:"department,omitempty" db:"department"`
	PasswordHash string     `json:"-" db:"password_hash"`
	CreatedAt    time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at" db:"updated_at"`
	IsActive     bool       `json:"is_active" db:"is_active"`
}

// Team represents a decision-making team
type Team struct {
	ID           uuid.UUID   `json:"id" db:"id"`
	Name         string      `json:"name" db:"name"`
	Description  *string     `json:"description,omitempty" db:"description"`
	Organization *string     `json:"organization,omitempty" db:"organization"`
	Department   *string     `json:"department,omitempty" db:"department"`
	TeamType     string      `json:"team_type" db:"team_type"` // clinical, administrative, executive, quality, safety
	Settings     interface{} `json:"settings,omitempty" db:"settings"`
	CreatedBy    *uuid.UUID  `json:"created_by,omitempty" db:"created_by"`
	CreatedAt    time.Time   `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time   `json:"updated_at" db:"updated_at"`
	IsActive     bool        `json:"is_active" db:"is_active"`
}

// TeamMember represents team membership with roles
type TeamMember struct {
	ID          uuid.UUID   `json:"id" db:"id"`
	TeamID      uuid.UUID   `json:"team_id" db:"team_id"`
	UserID      uuid.UUID   `json:"user_id" db:"user_id"`
	Role        string      `json:"role" db:"role"` // admin, moderator, member, observer
	Permissions interface{} `json:"permissions,omitempty" db:"permissions"`
	JoinedAt    time.Time   `json:"joined_at" db:"joined_at"`
	IsActive    bool        `json:"is_active" db:"is_active"`
}

// Decision represents a team decision
type Decision struct {
	ID                 uuid.UUID   `json:"id" db:"id"`
	TeamID             uuid.UUID   `json:"team_id" db:"team_id"`
	Title              string      `json:"title" db:"title"`
	Description        *string     `json:"description,omitempty" db:"description"`
	DecisionType       string      `json:"decision_type" db:"decision_type"` // clinical, operational, strategic, policy, resource
	Methodology        string      `json:"methodology" db:"methodology"` // DECIDE framework
	Status             string      `json:"status" db:"status"` // draft, active, under_review, completed, cancelled
	Priority           string      `json:"priority" db:"priority"` // low, medium, high, critical
	DueDate            *time.Time  `json:"due_date,omitempty" db:"due_date"`
	CreatedBy          *uuid.UUID  `json:"created_by,omitempty" db:"created_by"`
	CreatedAt          time.Time   `json:"created_at" db:"created_at"`
	UpdatedAt          time.Time   `json:"updated_at" db:"updated_at"`
	CompletedAt        *time.Time  `json:"completed_at,omitempty" db:"completed_at"`
	FinalDecision      *string     `json:"final_decision,omitempty" db:"final_decision"`
	Rationale          *string     `json:"rationale,omitempty" db:"rationale"`
	ImplementationPlan *string     `json:"implementation_plan,omitempty" db:"implementation_plan"`
	Metadata           interface{} `json:"metadata,omitempty" db:"metadata"`
}

// DecisionCriteria represents evaluation criteria for decisions
type DecisionCriteria struct {
	ID              uuid.UUID `json:"id" db:"id"`
	DecisionID      uuid.UUID `json:"decision_id" db:"decision_id"`
	Name            string    `json:"name" db:"name"`
	Description     *string   `json:"description,omitempty" db:"description"`
	Weight          float64   `json:"weight" db:"weight"`
	Category        string    `json:"category" db:"category"` // technical, financial, strategic, compliance, operational
	MeasurementType string    `json:"measurement_type" db:"measurement_type"` // qualitative, quantitative, binary
	AISuggested     bool      `json:"ai_suggested" db:"ai_suggested"`
	ConfidenceScore *float64  `json:"confidence_score,omitempty" db:"confidence_score"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
}

// DecisionOption represents possible decision alternatives
type DecisionOption struct {
	ID                     uuid.UUID   `json:"id" db:"id"`
	DecisionID             uuid.UUID   `json:"decision_id" db:"decision_id"`
	Name                   string      `json:"name" db:"name"`
	Description            *string     `json:"description,omitempty" db:"description"`
	EstimatedCost          *float64    `json:"estimated_cost,omitempty" db:"estimated_cost"`
	ImplementationTimeline *string     `json:"implementation_timeline,omitempty" db:"implementation_timeline"`
	VendorInfo             interface{} `json:"vendor_info,omitempty" db:"vendor_info"`
	FeasibilityAssessment  interface{} `json:"feasibility_assessment,omitempty" db:"feasibility_assessment"`
	RiskFactors            []string    `json:"risk_factors,omitempty" db:"risk_factors"`
	CreatedAt              time.Time   `json:"created_at" db:"created_at"`
}

// Evaluation represents anonymous team member evaluations
type Evaluation struct {
	ID               uuid.UUID   `json:"id" db:"id"`
	DecisionID       uuid.UUID   `json:"decision_id" db:"decision_id"`
	UserID           uuid.UUID   `json:"user_id" db:"user_id"` // For participation tracking only
	EvaluationToken  *uuid.UUID  `json:"evaluation_token,omitempty" db:"evaluation_token"`
	SubmittedAt      time.Time   `json:"submitted_at" db:"submitted_at"`
	IsComplete       bool        `json:"is_complete" db:"is_complete"`
	Comments         *string     `json:"comments,omitempty" db:"comments"`
	ConfidenceLevel  int         `json:"confidence_level" db:"confidence_level"` // 1-10
	Metadata         interface{} `json:"metadata,omitempty" db:"metadata"`
}

// EvaluationScore represents individual criterion scores (anonymized)
type EvaluationScore struct {
	ID           uuid.UUID `json:"id" db:"id"`
	EvaluationID uuid.UUID `json:"evaluation_id" db:"evaluation_id"`
	OptionID     uuid.UUID `json:"option_id" db:"option_id"`
	CriterionID  uuid.UUID `json:"criterion_id" db:"criterion_id"`
	Score        float64   `json:"score" db:"score"`
	Rationale    *string   `json:"rationale,omitempty" db:"rationale"`
	Confidence   float64   `json:"confidence" db:"confidence"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}

// Conflict represents detected evaluation conflicts
type Conflict struct {
	ID               uuid.UUID `json:"id" db:"id"`
	DecisionID       uuid.UUID `json:"decision_id" db:"decision_id"`
	OptionID         uuid.UUID `json:"option_id" db:"option_id"`
	CriterionID      uuid.UUID `json:"criterion_id" db:"criterion_id"`
	VarianceScore    float64   `json:"variance_score" db:"variance_score"`
	ConflictLevel    string    `json:"conflict_level" db:"conflict_level"` // low, medium, high, critical
	ResolutionStatus string    `json:"resolution_status" db:"resolution_status"` // unresolved, in_progress, resolved
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
}

// AuditLog represents audit trail entries
type AuditLog struct {
	ID           uuid.UUID   `json:"id" db:"id"`
	UserID       *uuid.UUID  `json:"user_id,omitempty" db:"user_id"`
	Action       string      `json:"action" db:"action"`
	ResourceID   *uuid.UUID  `json:"resource_id,omitempty" db:"resource_id"`
	ResourceType *string     `json:"resource_type,omitempty" db:"resource_type"`
	Details      interface{} `json:"details,omitempty" db:"details"`
	IPAddress    *string     `json:"ip_address,omitempty" db:"ip_address"`
	UserAgent    *string     `json:"user_agent,omitempty" db:"user_agent"`
	Timestamp    time.Time   `json:"timestamp" db:"timestamp"`
	Success      bool        `json:"success" db:"success"`
	ErrorMessage *string     `json:"error_message,omitempty" db:"error_message"`
}

// UserSession represents user SSO sessions
type UserSession struct {
	ID           uuid.UUID  `json:"id" db:"id"`
	UserID       uuid.UUID  `json:"user_id" db:"user_id"`
	SessionToken string     `json:"session_token" db:"session_token"`
	RefreshToken *string    `json:"refresh_token,omitempty" db:"refresh_token"`
	SSOProvider  *string    `json:"sso_provider,omitempty" db:"sso_provider"`
	ExpiresAt    time.Time  `json:"expires_at" db:"expires_at"`
	CreatedAt    time.Time  `json:"created_at" db:"created_at"`
	LastAccessed time.Time  `json:"last_accessed" db:"last_accessed"`
}

// WebSocketConnection represents active real-time connections
type WebSocketConnection struct {
	ID           uuid.UUID `json:"id" db:"id"`
	UserID       uuid.UUID `json:"user_id" db:"user_id"`
	TeamID       uuid.UUID `json:"team_id" db:"team_id"`
	ConnectionID string    `json:"connection_id" db:"connection_id"`
	ConnectedAt  time.Time `json:"connected_at" db:"connected_at"`
	LastPing     time.Time `json:"last_ping" db:"last_ping"`
	Status       string    `json:"status" db:"status"` // connected, disconnected
}

// LoginRequest represents authentication request
type LoginRequest struct {
	Email       string  `json:"email" binding:"required,email"`
	Password    string  `json:"password" binding:"required"`
	SSOProvider *string `json:"sso_provider,omitempty"`
}

// LoginResponse represents authentication response
type LoginResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int    `json:"expires_in"`
	User         User   `json:"user"`
}

// EvaluationRequest represents anonymous evaluation submission
type EvaluationRequest struct {
	Evaluations       []OptionEvaluation `json:"evaluations" binding:"required"`
	OverallConfidence float64            `json:"overall_confidence" binding:"required,min=1,max=10"`
	Notes             *string            `json:"notes,omitempty"`
}

type OptionEvaluation struct {
	OptionID        uuid.UUID        `json:"option_id" binding:"required"`
	CriterionScores []CriterionScore `json:"criterion_scores" binding:"required"`
}

type CriterionScore struct {
	CriterionID uuid.UUID `json:"criterion_id" binding:"required"`
	Score       float64   `json:"score" binding:"required,min=1,max=10"`
	Rationale   *string   `json:"rationale,omitempty"`
	Confidence  float64   `json:"confidence" binding:"required,min=1,max=10"`
}