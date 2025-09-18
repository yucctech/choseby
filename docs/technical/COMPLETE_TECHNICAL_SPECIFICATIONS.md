# Complete Technical Specifications - Healthcare Decision Platform

**⚠️ CRITICAL FOR ALL STAKEHOLDERS**: This document contains detailed specifications that prevent AI development tools from producing random code. All developers MUST reference these specifications before implementation.

**Cross-Reference Guide for Stakeholders**:
- **Database Schema**: See `docs/technical/database-schema.md` for complete table structures
- **Development Handoff**: See `docs/technical/development-handoff-specs.md` for implementation details  
- **Customer Requirements**: See `docs/business/customer-development.md` for pilot success criteria
- **Current Tasks**: See `docs/current/ACTIVE_TASKS.md` for sprint priorities

**Priority Order**: 2,4,1,3 (Phase Transition Logic, Acceptance Criteria, AI Integration, Data Validation)

## ⚠️ MANDATORY READING FOR AI DEVELOPMENT TOOLS

**Before implementing ANY feature, AI development tools MUST:**
1. Check Phase Transition Logic rules below
2. Verify Acceptance Criteria requirements  
3. Follow AI Integration contracts exactly
4. Implement Data Validation rules completely

**Failure to follow these specifications will result in rewrites and project delays.**

## Priority 2: Phase Transition Logic (DECIDE Methodology)

### DECIDE Framework - 6 Phase Implementation
```typescript
interface PhaseTransitionRules {
  phase_1_define: {
    name: "Define Problem"
    required_fields: ['problem_statement', 'stakeholders', 'success_criteria']
    validation_rules: {
      problem_statement: { min_length: 50, max_length: 500 }
      stakeholders: { min_count: 2, max_count: 10 }
      success_criteria: { min_count: 1, max_count: 5 }
    }
    completion_criteria: "All required fields completed AND reviewed by facilitator"
    next_phase_trigger: "facilitator_approval" | "auto_advance_after_24h"
  }
  
  phase_2_establish: {
    name: "Establish Criteria"
    required_fields: ['evaluation_criteria']
    validation_rules: {
      min_criteria_count: 3
      max_criteria_count: 8
      total_weight_sum: 100
      each_criteria: {
        name: { min_length: 5, max_length: 100 }
        description: { min_length: 20, max_length: 300 }
        weight: { min: 5, max: 40 }
        category: ['technical', 'financial', 'clinical', 'compliance', 'operational']
      }
    }
    completion_criteria: "Criteria defined AND weights sum to 100 AND team review completed"
    next_phase_trigger: "team_majority_approval" // >50% team approval
  }
  
  phase_3_consider: {
    name: "Consider Options"
    required_fields: ['options']
    validation_rules: {
      min_options_count: 2
      max_options_count: 6
      each_option: {
        name: { min_length: 5, max_length: 100 }
        description: { min_length: 50, max_length: 500 }
        estimated_cost: { optional: true, format: "decimal" }
        implementation_timeline: { optional: true, format: "weeks" }
      }
    }
    completion_criteria: "All options defined AND feasibility reviewed"
    next_phase_trigger: "auto_advance" // No approval needed
  }
  
  phase_4_identify: {
    name: "Identify Best Alternative (Anonymous Evaluation)"
    required_fields: ['team_evaluations']
    validation_rules: {
      min_evaluation_count: 3 // Minimum viable team size
      evaluation_completeness: "all_team_members" | "majority_threshold_70percent"
      scoring_scale: { min: 1, max: 10 }
      required_scores: "all_criteria_for_all_options"
    }
    completion_criteria: "All team members completed evaluations OR 7-day timeout"
    conflict_detection: {
      variance_threshold: 2.5 // Standard deviations
      disagreement_flag: "automatic_when_variance_exceeds_threshold"
      escalation_required: boolean
    }
    next_phase_trigger: "all_evaluations_complete" | "timeout_7_days"
  }
  
  phase_5_develop: {
    name: "Develop Action Plan"
    required_fields: ['implementation_plan', 'timeline', 'responsibilities']
    validation_rules: {
      implementation_plan: { min_length: 100, max_length: 1000 }
      timeline: { required_milestones: true, format: "date_range" }
      responsibilities: { min_assignees: 1, all_assignees_must_be_team_members: true }
    }
    completion_criteria: "Action plan complete AND responsibility assignments confirmed"
    next_phase_trigger: "facilitator_approval"
  }
  
  phase_6_evaluate: {
    name: "Evaluate and Monitor Decision"
    required_fields: ['success_metrics', 'review_schedule']
    validation_rules: {
      success_metrics: { min_count: 2, max_count: 5, must_be_measurable: true }
      review_schedule: { required_dates: true, min_reviews: 2 }
    }
    completion_criteria: "Monitoring plan established AND first review scheduled"
    next_phase_trigger: "decision_completed"
  }
}
```

### Phase State Management
```typescript
interface PhaseStateEngine {
  current_phase: number
  phase_status: 'not_started' | 'in_progress' | 'pending_approval' | 'completed' | 'blocked'
  
  transition_rules: {
    can_advance_to_next(): boolean
    can_return_to_previous(): boolean
    get_blocking_requirements(): string[]
    get_completion_percentage(): number
  }
  
  automatic_transitions: {
    timeout_transitions: { phase_4: '7_days', phase_2: '24_hours' }
    approval_thresholds: { team_majority: 0.7, facilitator_required: ['phase_1', 'phase_5'] }
  }
}
```

## Priority 4: Comprehensive Acceptance Criteria

### User Story Acceptance Criteria

#### Epic: Anonymous Team Evaluation System
```gherkin
Feature: Anonymous Scoring with Conflict Detection

  Background:
    Given a healthcare team with 5 members
    And a decision in Phase 4 "Identify Best Alternative"
    And 3 options defined with 4 evaluation criteria

  Scenario: Successful anonymous evaluation completion
    Given all team members have access to the decision
    When each member submits scores for all option-criteria combinations
    And provides optional rationale for their highest/lowest scores
    Then the system calculates weighted averages automatically
    And displays team progress without revealing individual scores
    And advances to Phase 5 when all evaluations submitted

  Scenario: Conflict detection and escalation
    Given 4 team members have submitted evaluations
    When scores for "Option A - Cost Criterion" have variance >2.5 standard deviations
    Then the system flags this as a conflict automatically
    And sends notification to facilitator immediately
    And blocks phase advancement until conflict addressed
    And provides conflict resolution tools

  Scenario: Partial team participation handling
    Given 3 out of 5 team members have submitted evaluations
    When 7 days have elapsed since evaluation phase started
    Then the system automatically calculates results with available data
    And notes incomplete participation in the decision record
    And sends final reminder to non-participating members
    And advances to Phase 5 with partial results
```

#### Feature: Healthcare Team Management
```gherkin
Feature: HIPAA-Compliant Team Collaboration

  Scenario: Secure team member invitation
    Given a team admin wants to invite a new clinical team member
    When they enter the member's healthcare organization email
    And specify their role as "clinical_lead"
    And assign expertise area as "emergency_medicine"
    Then the system sends encrypted invitation email
    And creates pending user record with proper access controls
    And logs invitation action for audit trail

  Scenario: Role-based access enforcement
    Given a team member with "member" role
    When they attempt to access team management settings
    Then the system denies access with clear error message
    And logs the unauthorized access attempt
    And maintains team data security
```

#### Feature: Professional Documentation Generation
```gherkin
Feature: Board-Ready Decision Documentation

  Scenario: Complete decision report generation
    Given a decision completed through all 6 DECIDE phases
    When the facilitator requests a professional report
    Then the system generates a PDF document containing:
      - Executive summary with final recommendation
      - Complete methodology description
      - Anonymous evaluation summary (no individual attribution)
      - Conflict resolution documentation
      - Implementation plan with timelines
      - Audit trail with timestamps
    And the document meets healthcare compliance standards
    And includes team member signatures/approvals
```

### API Endpoint Acceptance Criteria

#### Decision Management Endpoints
```typescript
// POST /api/decisions - Create Decision
interface CreateDecisionAcceptance {
  input_validation: {
    title: "Required, 5-200 characters, healthcare context appropriate"
    description: "Required, 50-2000 characters"
    decision_type: "Must be valid enum value"
    patient_impact_level: "Required for clinical decisions, optional for administrative"
    estimated_budget: "Optional, must be positive number if provided"
  }
  
  output_requirements: {
    response_time: "<500ms"
    data_structure: "Complete decision object with generated ID"
    phase_initialization: "Automatically set to phase 1 with empty phase_data"
    team_notifications: "All team members notified via email/in-app"
    audit_trail: "Creation logged with timestamp and creator ID"
  }
  
  error_handling: {
    invalid_input: "Return 400 with specific field errors"
    unauthorized: "Return 401 if user not team member"
    team_limit_exceeded: "Return 429 if team has >10 active decisions"
  }
}

// PUT /api/decisions/{id}/phases/{phase_number} - Update Phase
interface UpdatePhaseAcceptance {
  validation_rules: "Enforce phase transition rules from PhaseTransitionRules"
  data_integrity: "Validate phase_data structure matches phase requirements"
  concurrency_handling: "Prevent simultaneous edits by multiple users"
  audit_trail: "Log all phase updates with user attribution"
  real_time_updates: "Broadcast changes to all team members via WebSocket"
}
```

## Priority 1: AI Integration Specifications

### DeepSeek R1 Local Model Integration
```typescript
interface AIModelIntegration {
  model_specifications: {
    model_name: "DeepSeek-R1-Distill-Qwen-7B"
    hardware_requirements: {
      min_vram: "8GB"
      recommended_vram: "12GB"
      cpu_cores: "8+"
      ram: "16GB+"
    }
    performance_targets: {
      framework_suggestion: "2000ms max response time"
      criteria_generation: "3000ms max response time"
      max_concurrent_requests: 3
    }
  }
  
  framework_suggestion_contract: {
    input_format: {
      decision_description: string // 50-2000 characters
      industry_context: "healthcare" | "professional_services" | "manufacturing" | "tech"
      decision_type: "vendor_selection" | "hiring" | "strategic" | "budget" | "compliance"
      team_size: number // 3-8 members
      compliance_requirements?: string[]
    }
    
    output_format: {
      recommended_framework: {
        framework_id: string
        framework_name: string
        confidence_score: number // 0.0-1.0
        reasoning: string // Why this framework was selected
      }
      alternative_frameworks: Array<{
        framework_id: string
        confidence_score: number
        use_case: string
      }>
      suggested_criteria: Array<{
        name: string
        description: string
        category: "technical" | "financial" | "clinical" | "compliance" | "operational"
        suggested_weight: number // 1-40
        healthcare_specific: boolean
      }>
    }
    
    error_handling: {
      model_timeout: "Return default healthcare framework after 2000ms"
      model_unavailable: "Fallback to predefined framework templates"
      invalid_input: "Return error with specific validation messages"
    }
  }
  
  criteria_generation_contract: {
    input_format: {
      decision_type: string
      context_description: string
      existing_criteria?: Array<{ name: string, description: string }>
      compliance_requirements: string[]
      budget_range?: "under_10k" | "10k_50k" | "50k_plus"
    }
    
    output_format: {
      generated_criteria: Array<{
        name: string
        description: string
        rationale: string // Why this criterion is important
        category: string
        healthcare_considerations?: string
        compliance_relevance?: string
      }>
      quality_metrics: {
        criteria_coverage_score: number // How well criteria cover decision space
        healthcare_compliance_level: "basic" | "standard" | "advanced"
        estimated_decision_complexity: "low" | "medium" | "high"
      }
    }
  }
}

// API Fallback Integration (10% usage budget)
interface ExternalAPIIntegration {
  primary_provider: "openai" // GPT-4o-mini for cost optimization
  monthly_budget: 10 // USD
  usage_allocation: {
    complex_decisions: "40%" // >5 options, >6 criteria
    industry_customization: "30%" // Healthcare-specific adaptations
    conflict_analysis: "20%" // Advanced disagreement resolution
    outcome_prediction: "10%" // Historical pattern analysis
  }
  
  request_optimization: {
    caching_strategy: "Cache framework suggestions for 30 days"
    batch_processing: "Combine similar requests when possible"
    priority_queuing: "Healthcare compliance requests prioritized"
  }
}
```

### AI Model Error Handling & Fallbacks
```typescript
interface AIErrorHandling {
  local_model_failures: {
    timeout_2000ms: "Return cached framework or manual selection"
    memory_exhaustion: "Restart model service, notify admin"
    model_corruption: "Fallback to API, schedule model reinstall"
    concurrent_limit_exceeded: "Queue request with user notification"
  }
  
  api_fallback_scenarios: {
    monthly_budget_exceeded: "Disable AI features, use manual frameworks"
    api_service_unavailable: "Use local model or cached responses"
    rate_limits_hit: "Queue requests, notify users of delay"
    invalid_api_response: "Log error, return manual framework options"
  }
  
  graceful_degradation: {
    no_ai_available: {
      framework_suggestion: "Show predefined healthcare framework library"
      criteria_generation: "Provide healthcare criteria templates"
      user_experience: "Clear messaging about manual vs AI-assisted modes"
    }
  }
}
```

## Priority 3: Data Validation Rules

### Healthcare-Specific Data Validation
```typescript
interface HealthcareDataValidation {
  patient_impact_assessment: {
    required_when: [
      "decision_type === 'clinical_protocol'",
      "decision_type === 'vendor_selection' AND vendor_category === 'clinical_systems'",
      "estimated_budget > 50000 AND industry === 'healthcare'"
    ]
    validation_method: "dropdown_selection" // Prevent free-text errors
    allowed_values: ["none", "low", "medium", "high", "critical"]
    escalation_rules: {
      high_or_critical: "Require additional clinical stakeholder approval"
      medium_plus: "Mandate regulatory compliance review"
    }
  }
  
  compliance_documentation: {
    audit_trail_required: true
    retention_period_days: 2555 // 7 years for healthcare
    required_fields: {
      decision_rationale: { min_length: 100, max_length: 2000 }
      stakeholder_approvals: { min_approvers: 1, role_requirements: ["clinical_lead", "admin"] }
      regulatory_considerations: { required_for_high_patient_impact: true }
    }
    
    data_classification: {
      phi_handling: "No PHI in decision platform - administrative decisions only"
      hipaa_compliance: "Encrypt all data at rest and in transit"
      access_logging: "Log all data access with user attribution"
    }
  }
  
  team_member_validation: {
    email_domain_restrictions: {
      healthcare_organizations: "Validate email domains against healthcare org registry"
      allowed_domains: ["*.health.org", "*.hospital.com", "*.clinic.net"]
      validation_method: "DNS MX record check + domain reputation"
    }
    
    role_assignments: {
      clinical_lead: { requires_medical_license_verification: false } // MVP: Trust-based
      admin: { requires_organization_admin_approval: true }
      member: { default_role: true, no_special_requirements: true }
    }
  }
}

// Real-time Data Validation Rules
interface RealTimeValidation {
  scoring_validation: {
    score_range: { min: 1, max: 10, type: "integer" }
    required_scores: "All criteria for all options must be scored"
    rationale_requirements: {
      optional_by_default: true
      required_for_extreme_scores: { min_score: 1, max_score: 10 }
      min_length_when_provided: 20
    }
    
    conflict_detection_real_time: {
      calculate_variance_on_each_submission: true
      flag_conflicts_immediately: true
      variance_threshold: 2.5 // Standard deviations
      minimum_submissions_for_detection: 3
    }
  }
  
  phase_data_validation: {
    phase_1_problem_definition: {
      problem_statement: { 
        min_length: 50, 
        max_length: 500,
        healthcare_keyword_check: "Flag if no healthcare context detected"
      }
      stakeholders: {
        min_count: 2,
        max_count: 10,
        role_diversity_check: "Warn if all stakeholders have same role"
      }
    }
    
    phase_2_criteria_establishment: {
      weight_sum_validation: "Real-time validation that weights sum to 100"
      criteria_overlap_detection: "Flag similar criteria names/descriptions"
      healthcare_relevance_check: "Suggest healthcare-specific criteria if missing"
    }
  }
}

// Database Integrity Rules
interface DatabaseIntegrityValidation {
  referential_integrity: {
    cascade_rules: {
      team_deletion: "Cascade to all team decisions and evaluations"
      user_removal: "Anonymize evaluations, maintain audit trail"
      decision_archival: "Preserve all data, mark as archived"
    }
    
    orphan_prevention: {
      evaluations_without_decisions: "Prevent via foreign key constraints"
      phases_without_decisions: "Prevent via foreign key constraints"
      conflicts_without_evaluations: "Auto-cleanup if parent evaluation deleted"
    }
  }
  
  data_consistency_checks: {
    evaluation_completeness: "Verify all option-criteria combinations scored"
    phase_data_structure: "Validate JSON schema for each phase type"
    team_member_count: "Enforce 3-8 member limit per team"
    decision_state_consistency: "Prevent invalid phase transitions"
  }
}
```

## Implementation Checklist

### Phase Transition Logic ✅
- [ ] Implement PhaseTransitionRules state machine
- [ ] Create phase validation middleware
- [ ] Add automatic transition triggers
- [ ] Build conflict detection algorithms

### Acceptance Criteria ✅  
- [ ] Convert all user stories to Gherkin format
- [ ] Define API endpoint acceptance criteria
- [ ] Create comprehensive test scenarios
- [ ] Establish error handling specifications

### AI Integration ✅
- [ ] Install and configure DeepSeek R1 model
- [ ] Implement framework suggestion API
- [ ] Create criteria generation pipeline
- [ ] Build API fallback system with usage tracking

### Data Validation ✅
- [ ] Implement healthcare-specific validation rules
- [ ] Create real-time validation middleware
- [ ] Build database integrity constraints
- [ ] Add HIPAA compliance validation

**Status**: All specification gaps identified and detailed. Ready for implementation with no ambiguity.