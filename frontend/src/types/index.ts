// Customer Response Platform - TypeScript Type Definitions
// Based on backend Go models and database schema

// ========================================
// UI TYPES
// ========================================

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// ========================================
// USER & TEAM TYPES
// ========================================

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  organization: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
}

// ========================================
// CUSTOMER RESPONSE DECISION TYPES
// ========================================

export type CustomerTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'enterprise';
export type UrgencyLevel = 1 | 2 | 3 | 4 | 5;
export type DecisionStatus = 'draft' | 'in_progress' | 'completed' | 'archived';
export type WorkflowType = 'full_decide' | 'quick_input' | 'ai_only';

export interface CustomerDecision {
  id: string;
  team_id: string;
  title: string;
  description: string;

  // Customer Context
  customer_name: string;
  customer_email?: string;
  customer_tier: CustomerTier;
  customer_tier_detailed?: string; // bronze, silver, gold, platinum
  customer_value?: number; // LTV in dollars
  urgency_level: UrgencyLevel;
  urgency_level_detailed?: string; // low, medium, high, critical
  customer_impact_scope?: string; // single_user, team, department, company
  relationship_duration_months?: number;
  relationship_history?: string;
  previous_issues_count: number;
  last_interaction_date?: string;
  nps_score?: number;

  // Decision Context
  decision_type: string; // billing_dispute, service_outage, refund_full, etc.
  financial_impact?: number;

  // Workflow
  status: DecisionStatus;
  workflow_type: WorkflowType;
  current_phase: number;

  // AI Classification
  ai_classification?: AIClassification;
  ai_recommendations?: AIRecommendations;

  // Metadata
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ========================================
// AI INTEGRATION TYPES
// ========================================

export interface AIClassification {
  decision_type: string;
  urgency_level: number;
  confidence_score: number;
  risk_factors: string[];
  classified_at?: string;
}

export interface AIRecommendations {
  recommended_stakeholders: StakeholderRecommendation[];
  suggested_criteria: SuggestedCriterion[];
  generated_at?: string;
}

export interface StakeholderRecommendation {
  role: string;
  weight: number;
  reasoning: string;
}

export interface SuggestedCriterion {
  name: string;
  description: string;
  weight: number;
}

export interface ResponseDraft {
  draft_content: string;
  key_points: string[];
  tone: string;
  estimated_satisfaction_impact: 'positive' | 'neutral' | 'negative';
  follow_up_recommendations: string[];
}

// ========================================
// CUSTOMER RESPONSE TYPES
// ========================================

export interface CustomerResponseType {
  id: string;
  type_code: string; // billing_dispute, service_outage, refund_full, etc.
  type_name: string;
  description?: string;
  typical_resolution_time_hours?: number;
  escalation_required: boolean;
  default_stakeholders: string[];
  ai_classification_keywords: string[];
  created_at: string;
  updated_at: string;
}

// ========================================
// DECISION WORKFLOW TYPES
// ========================================

export interface DecisionCriteria {
  id: string;
  decision_id: string;
  name: string;
  description?: string;
  weight: number;
  created_by: string;
  created_at: string;
}

export interface ResponseOption {
  id: string;
  decision_id: string;
  title: string;
  description: string;
  financial_cost: number;
  implementation_effort: 'low' | 'medium' | 'high';
  risk_level: 'low' | 'medium' | 'high';
  estimated_satisfaction_impact: number; // 1-5 scale
  created_by: string;
  created_at: string;
}

export interface TeamEvaluation {
  id: string;
  decision_id: string;
  evaluator_id: string;
  option_id: string;
  scores: Record<string, number>; // criterion_id -> score
  comments?: string;
  submitted_at: string;
  is_anonymous: boolean;
}

// ========================================
// OUTCOME TRACKING TYPES
// ========================================

export interface DecisionOutcome {
  id: string;
  decision_id: string;
  selected_option_id: string;

  // Response Metrics
  decision_date: string;
  response_sent_date?: string;
  time_to_first_response_hours?: number;
  time_to_resolution_hours?: number;

  // Customer Satisfaction
  customer_satisfaction_score?: number; // 1-5 scale
  nps_score_change?: number;
  customer_feedback?: string;

  // Decision Quality
  team_consensus_score: number; // 0-1 scale
  ai_accuracy_rating?: number; // How accurate was AI classification

  // Financial Impact
  actual_cost?: number;
  revenue_impact?: number; // Negative = lost revenue, Positive = retained/gained

  // Learning
  lessons_learned?: string;
  would_decide_same_again: boolean;

  recorded_by: string;
  recorded_at: string;
}

// ========================================
// API RESPONSE TYPES
// ========================================

export interface APIResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
}

// ========================================
// FORM & UI TYPES
// ========================================

export interface CustomerContextFormData {
  customer_name: string;
  customer_email: string;
  customer_tier: CustomerTier;
  customer_tier_detailed: string;
  customer_value: number;
  urgency_level: UrgencyLevel;
  urgency_level_detailed: string;
  customer_impact_scope: string;
  relationship_duration_months: number;
  previous_issues_count: number;
  nps_score: number;
}

export interface DecisionFormData {
  title: string;
  description: string;
  decision_type: string;
  financial_impact: number;
  workflow_type: WorkflowType;
}

// ========================================
// DASHBOARD & ANALYTICS TYPES
// ========================================

export interface DashboardMetrics {
  total_decisions: number;
  decisions_in_progress: number;
  avg_response_time_hours: number;
  avg_customer_satisfaction: number;
  decisions_this_week: number;
  decisions_this_month: number;
}

export interface ResponseTimeMetrics {
  avg_time_to_first_response: number;
  avg_time_to_resolution: number;
  median_response_time: number;
  percentile_95: number;
}

export interface CustomerSatisfactionMetrics {
  avg_satisfaction_score: number;
  avg_nps_change: number;
  satisfaction_by_tier: Record<CustomerTier, number>;
  satisfaction_by_response_type: Record<string, number>;
}
