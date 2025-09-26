# Customer Response Platform: Frontend TypeScript Types
## Core Type Definitions for Next.js Implementation

### 🎯 **OVERVIEW**
Complete TypeScript type definitions for Customer Response Decision Intelligence platform frontend.

---

## 🏗️ **CORE TYPES**

```typescript
// src/types/index.ts

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer_success_manager' | 'support_manager' | 'account_manager' | 
        'sales_manager' | 'legal_compliance' | 'operations_manager';
  team_id: string;
  is_active: boolean;
}

export interface Team {
  id: string;
  name: string;
  company_name: string;
  industry?: string;
  subscription_tier: 'starter' | 'professional' | 'enterprise';
}

export interface CustomerDecision {
  id: string;
  team_id: string;
  created_by: string;
  customer_name: string;
  customer_email?: string;
  customer_tier: 'basic' | 'standard' | 'premium' | 'enterprise';
  customer_value?: number;
  relationship_duration_months: number;
  title: string;
  description: string;
  decision_type: 'refund_request' | 'billing_dispute' | 'service_escalation' | 
                 'policy_exception' | 'contract_modification' | 'churn_prevention';
  urgency_level: 1 | 2 | 3 | 4 | 5;
  financial_impact?: number;
  status: 'created' | 'team_input' | 'evaluating' | 'resolved' | 'cancelled';
  current_phase: 1 | 2 | 3 | 4 | 5 | 6;
  expected_resolution_date?: string;
  actual_resolution_date?: string;
  ai_classification?: AIClassification;
  ai_recommendations?: AIRecommendation[];
  ai_confidence_score?: number;
  created_at: string;
  updated_at: string;
}

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
  financial_cost?: number;
  implementation_effort: 'low' | 'medium' | 'high';
  risk_level: 'low' | 'medium' | 'high';
  ai_generated: boolean;
  created_by?: string;
  created_at: string;
}

export interface Evaluation {
  id: string;
  decision_id: string;
  evaluator_id: string;
  option_id: string;
  criteria_id: string;
  score: number;
  confidence: number;
  anonymous_comment?: string;
  created_at: string;
}

export interface DecisionOutcome {
  id: string;
  decision_id: string;
  selected_option_id: string;
  response_sent_at?: string;
  customer_satisfaction_score?: number;
  escalation_occurred: boolean;
  resolution_time_hours?: number;
  follow_up_required: boolean;
  follow_up_date?: string;
  outcome_notes?: string;
  financial_impact_actual?: number;
  customer_retained?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIClassification {
  decision_type: string;
  urgency_level: number;
  confidence_score: number;
  risk_factors: string[];
}

export interface AIRecommendation {
  role: string;
  weight: number;
  reasoning: string;
}

export interface EvaluationResults {
  option_scores: {
    option_id: string;
    option_title: string;
    average_score: number;
    weighted_score: number;
    evaluators: number;
    consensus: number;
    conflict_level: 'none' | 'low' | 'medium' | 'high';
  }[];
  participation_rate: number;
  completed_by: string[];
  pending_from: string[];
  recommended_option?: string;
  team_consensus: number;
}
```

---

## 📡 **API REQUEST/RESPONSE TYPES**

```typescript
// API Request Types
export interface CreateDecisionRequest {
  customer_name: string;
  customer_email?: string;
  customer_tier: string;
  customer_value?: number;
  relationship_duration_months: number;
  title: string;
  description: string;
  decision_type: string;
  urgency_level: number;
  financial_impact?: number;
  expected_resolution_date?: string;
}

export interface UpdateCriteriaRequest {
  criteria: {
    name: string;
    description?: string;
    weight: number;
  }[];
}

export interface UpdateOptionsRequest {
  options: {
    title: string;
    description: string;
    financial_cost?: number;
    implementation_effort: string;
    risk_level: string;
  }[];
}

export interface SubmitEvaluationRequest {
  evaluations: {
    option_id: string;
    criteria_id: string;
    score: number;
    confidence: number;
    comment?: string;
  }[];
}

export interface AIClassifyRequest {
  customer_context: {
    name: string;
    tier: string;
    value?: number;
    relationship_duration_months: number;
  };
  issue_description: string;
  team_roles: string[];
}

// API Response Types
export interface AuthResponse {
  token: string;
  user: User;
  team: Team;
  expires_at: string;
}

export interface DecisionListResponse {
  decisions: CustomerDecision[];
  total: number;
  limit: number;
  offset: number;
}

export interface DecisionDetailResponse {
  decision: CustomerDecision;
  criteria: DecisionCriteria[];
  options: ResponseOption[];
  evaluations: Evaluation[];
  outcome?: DecisionOutcome;
}

export interface AIClassifyResponse {
  classification: AIClassification;
  recommended_stakeholders: AIRecommendation[];
  suggested_criteria: {
    name: string;
    description: string;
    weight: number;
  }[];
}
```

---

## 🎨 **UI COMPONENT PROP TYPES**

```typescript
// Component Props
export interface DecisionCardProps {
  decision: CustomerDecision;
  priority?: 'normal' | 'urgent';
  onClick?: () => void;
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea';
  className?: string;
}

export interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export interface ProgressProps {
  current: number;
  total: number;
  phases: string[];
  className?: string;
}

export interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}
```

---

## 🔄 **HOOK TYPES**

```typescript
// Hook Return Types
export interface UseAuthReturn {
  user: User | null;
  team: Team | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface UseDecisionsReturn {
  decisions: CustomerDecision[];
  loading: boolean;
  error: string | null;
  createDecision: (data: CreateDecisionRequest) => Promise<CustomerDecision>;
  updateDecision: (id: string, data: Partial<CustomerDecision>) => Promise<void>;
  deleteDecision: (id: string) => Promise<void>;
  refetch: () => void;
}

export interface UseAIReturn {
  classifyIssue: (data: AIClassifyRequest) => Promise<AIClassifyResponse>;
  generateOptions: (data: any) => Promise<any>;
  loading: boolean;
  error: string | null;
}

export interface UseEvaluationReturn {
  submitEvaluation: (decisionId: string, data: SubmitEvaluationRequest) => Promise<void>;
  getResults: (decisionId: string) => Promise<EvaluationResults>;
  loading: boolean;
  error: string | null;
}
```

---

## 🎨 **UTILITY TYPES**

```typescript
// Utility Types
export type CustomerTier = 'basic' | 'standard' | 'premium' | 'enterprise';
export type DecisionType = 'refund_request' | 'billing_dispute' | 'service_escalation' | 
                          'policy_exception' | 'contract_modification' | 'churn_prevention';
export type DecisionStatus = 'created' | 'team_input' | 'evaluating' | 'resolved' | 'cancelled';
export type UrgencyLevel = 1 | 2 | 3 | 4 | 5;
export type TeamRole = 'customer_success_manager' | 'support_manager' | 'account_manager' | 
                      'sales_manager' | 'legal_compliance' | 'operations_manager';

// Form Types
export interface RegisterData {
  email: string;
  name: string;
  password: string;
  team_name: string;
  company: string;
  role: TeamRole;
}

export interface LoginData {
  email: string;
  password: string;
}

// Filter Types
export interface DecisionFilters {
  status?: DecisionStatus[];
  urgency?: UrgencyLevel[];
  decision_type?: DecisionType[];
  customer_tier?: CustomerTier[];
  date_range?: {
    start: string;
    end: string;
  };
}

// Sort Types
export interface SortOption {
  field: keyof CustomerDecision;
  direction: 'asc' | 'desc';
}
```

**Status**: TypeScript types complete
**Next**: React components implementation guide