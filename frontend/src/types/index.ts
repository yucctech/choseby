export interface User {
  id: string;
  email: string;
  name: string;
  role: 'physician' | 'nurse' | 'administrator' | 'technician' | 'pharmacist' | 'other';
  department?: string;
  license_number?: string;
  created_at: string;
  last_login?: string;
}

export interface Team {
  id: string;
  name: string;
  organization: string;
  industry: string;
  compliance_requirements: {
    hipaa: boolean;
    joint_commission: boolean;
    patient_safety: boolean;
  };
  settings: {
    evaluation_timeout_hours: number;
    conflict_threshold: number;
  };
  member_count?: number;
  active_decisions?: number;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'member' | 'facilitator' | 'administrator' | 'observer';
  permissions: string[];
  user?: User;
  joined_at: string;
}

export interface Decision {
  id: string;
  team_id: string;
  title: string;
  description?: string;
  status: 'draft' | 'in_progress' | 'completed' | 'archived' | 'emergency';
  workflow_type: 'emergency' | 'express' | 'full_decide';
  current_phase: 1 | 2 | 3 | 4 | 5 | 6;
  decision_type: 'vendor_selection' | 'hiring' | 'strategic' | 'budget' | 'compliance' | 'clinical';
  urgency: 'low' | 'normal' | 'high' | 'emergency';
  patient_impact: 'none' | 'low' | 'medium' | 'high';
  budget_min?: number;
  budget_max?: number;
  regulatory_deadline?: string;
  implementation_deadline?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DecisionCriteria {
  id: string;
  decision_id: string;
  name: string;
  description?: string;
  weight: number;
  category: 'technical' | 'financial' | 'clinical' | 'compliance' | 'operational';
  measurement_type: 'qualitative' | 'quantitative' | 'binary';
  ai_suggested: boolean;
  confidence_score?: number;
  created_at: string;
}

export interface DecisionOption {
  id: string;
  decision_id: string;
  name: string;
  description?: string;
  estimated_cost?: number;
  implementation_timeline?: string;
  vendor_info?: Record<string, unknown>;
  feasibility_assessment?: Record<string, unknown>;
  risk_factors?: string[];
  created_at: string;
}

export interface Evaluation {
  id: string;
  decision_id: string;
  user_id: string;
  overall_confidence: number;
  evaluation_notes?: string;
  submitted_at: string;
}

export interface EvaluationScore {
  id: string;
  evaluation_id: string;
  option_id: string;
  criterion_id: string;
  score: number;
  rationale?: string;
  confidence: number;
  created_at: string;
}

export interface ConflictDetection {
  option_id: string;
  criterion_id: string;
  option_name: string;
  criterion_name: string;
  evaluation_count: number;
  mean_score: number;
  score_variance: number;
  conflict_level: 'none' | 'low' | 'medium' | 'high';
  score_range?: {
    min: number;
    max: number;
    mean: number;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
  teams: Team[];
}

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';