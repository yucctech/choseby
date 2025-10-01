-- Migration: Add Customer Response Context Fields
-- Purpose: Extend customer_decisions table with additional customer context for improved decision quality
-- Version: 001
-- Date: 2025-10-01

-- Add new customer context fields to customer_decisions table
ALTER TABLE customer_decisions
    ADD COLUMN IF NOT EXISTS customer_tier_detailed VARCHAR(20) DEFAULT 'standard'
        CHECK (customer_tier_detailed IN ('bronze', 'silver', 'gold', 'platinum', 'standard')),
    ADD COLUMN IF NOT EXISTS urgency_level_detailed VARCHAR(20) DEFAULT 'medium'
        CHECK (urgency_level_detailed IN ('low', 'medium', 'high', 'critical')),
    ADD COLUMN IF NOT EXISTS customer_impact_scope VARCHAR(30) DEFAULT 'single_user'
        CHECK (customer_impact_scope IN ('single_user', 'team', 'department', 'company')),
    ADD COLUMN IF NOT EXISTS relationship_history TEXT,
    ADD COLUMN IF NOT EXISTS previous_issues_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_interaction_date TIMESTAMP,
    ADD COLUMN IF NOT EXISTS nps_score INTEGER CHECK (nps_score BETWEEN -100 AND 100);

-- Create customer_response_types lookup table
CREATE TABLE IF NOT EXISTS customer_response_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_code VARCHAR(50) NOT NULL UNIQUE,
    type_name VARCHAR(100) NOT NULL,
    description TEXT,
    typical_resolution_time_hours INTEGER,
    requires_escalation BOOLEAN DEFAULT false,
    default_stakeholders TEXT[],
    ai_classification_keywords TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create outcome_tracking table for satisfaction correlation
CREATE TABLE IF NOT EXISTS outcome_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID NOT NULL REFERENCES customer_decisions(id) ON DELETE CASCADE,
    outcome_id UUID REFERENCES decision_outcomes(id) ON DELETE SET NULL,

    -- Response Time Metrics
    decision_created_at TIMESTAMP NOT NULL,
    first_response_at TIMESTAMP,
    resolution_at TIMESTAMP,
    time_to_first_response_hours DECIMAL(8,2),
    time_to_resolution_hours DECIMAL(8,2),

    -- Customer Satisfaction Metrics
    customer_satisfaction_score INTEGER CHECK (customer_satisfaction_score BETWEEN 1 AND 10),
    nps_change INTEGER CHECK (nps_change BETWEEN -200 AND 200),
    customer_retained BOOLEAN,
    escalation_occurred BOOLEAN DEFAULT false,

    -- Decision Quality Metrics
    team_consensus_score DECIMAL(3,2), -- 0.0 to 1.0
    ai_accuracy_validation BOOLEAN,
    option_effectiveness_rating INTEGER CHECK (option_effectiveness_rating BETWEEN 1 AND 5),

    -- Learning Data
    what_worked_well TEXT,
    what_could_improve TEXT,
    lessons_learned TEXT,

    -- Financial Impact
    estimated_financial_impact DECIMAL(12,2),
    actual_financial_impact DECIMAL(12,2),
    roi_ratio DECIMAL(5,2),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_decisions_tier_detailed ON customer_decisions(customer_tier_detailed);
CREATE INDEX IF NOT EXISTS idx_customer_decisions_urgency_detailed ON customer_decisions(urgency_level_detailed, created_at);
CREATE INDEX IF NOT EXISTS idx_customer_decisions_impact_scope ON customer_decisions(customer_impact_scope);
CREATE INDEX IF NOT EXISTS idx_customer_decisions_nps ON customer_decisions(nps_score);
CREATE INDEX IF NOT EXISTS idx_response_types_code ON customer_response_types(type_code);
CREATE INDEX IF NOT EXISTS idx_outcome_tracking_decision ON outcome_tracking(decision_id);
CREATE INDEX IF NOT EXISTS idx_outcome_tracking_satisfaction ON outcome_tracking(customer_satisfaction_score, created_at);
CREATE INDEX IF NOT EXISTS idx_outcome_tracking_response_time ON outcome_tracking(time_to_resolution_hours);

-- Insert standard customer response types
INSERT INTO customer_response_types (type_code, type_name, description, typical_resolution_time_hours, requires_escalation, default_stakeholders, ai_classification_keywords) VALUES
('refund_full', 'Full Refund Request', 'Customer requesting complete refund for product or service', 24, true, ARRAY['customer_success_manager', 'account_manager', 'legal_compliance'], ARRAY['refund', 'money back', 'full refund', 'complete refund']),
('refund_partial', 'Partial Refund Request', 'Customer requesting partial refund or credit', 12, false, ARRAY['customer_success_manager', 'support_manager'], ARRAY['partial refund', 'credit', 'discount', 'compensation']),
('billing_dispute', 'Billing Dispute', 'Customer disputes billing charge or invoice', 24, true, ARRAY['account_manager', 'legal_compliance'], ARRAY['billing error', 'wrong charge', 'dispute invoice', 'incorrect billing']),
('service_outage', 'Service Outage Response', 'Customer affected by service disruption or downtime', 4, true, ARRAY['customer_success_manager', 'operations_manager'], ARRAY['outage', 'downtime', 'service unavailable', 'system down', 'not working']),
('feature_request', 'Feature Request/Exception', 'Customer requesting feature or policy exception', 72, false, ARRAY['customer_success_manager', 'sales_manager'], ARRAY['feature', 'exception', 'special request', 'custom requirement']),
('contract_change', 'Contract Modification', 'Customer requesting contract terms change', 48, true, ARRAY['account_manager', 'legal_compliance', 'sales_manager'], ARRAY['contract change', 'terms modification', 'agreement update', 'pricing change']),
('churn_risk', 'Churn Prevention', 'Customer expressing intent to cancel or downgrade', 24, true, ARRAY['customer_success_manager', 'account_manager', 'sales_manager'], ARRAY['cancel', 'downgrade', 'not satisfied', 'competitor', 'leaving']),
('escalation', 'Customer Escalation', 'Customer requesting escalation to management', 8, true, ARRAY['customer_success_manager', 'account_manager', 'operations_manager'], ARRAY['escalate', 'manager', 'supervisor', 'urgent', 'emergency']),
('data_privacy', 'Data Privacy Request', 'Customer data access, deletion, or privacy concern', 48, true, ARRAY['legal_compliance', 'operations_manager'], ARRAY['privacy', 'GDPR', 'data deletion', 'data access', 'personal data']),
('general_inquiry', 'General Inquiry', 'Standard customer inquiry or question', 12, false, ARRAY['support_manager'], ARRAY['question', 'inquiry', 'how to', 'information', 'help']);

-- Add comments for documentation
COMMENT ON COLUMN customer_decisions.customer_tier_detailed IS 'Detailed customer tier classification for prioritization';
COMMENT ON COLUMN customer_decisions.urgency_level_detailed IS 'Detailed urgency classification for SLA management';
COMMENT ON COLUMN customer_decisions.customer_impact_scope IS 'Scope of customer impact for prioritization';
COMMENT ON COLUMN customer_decisions.relationship_history IS 'Historical context of customer relationship for decision context';
COMMENT ON TABLE customer_response_types IS 'Lookup table for standardized customer response types with AI classification support';
COMMENT ON TABLE outcome_tracking IS 'Comprehensive outcome tracking for customer satisfaction correlation and continuous improvement';
COMMENT ON COLUMN outcome_tracking.team_consensus_score IS 'Measure of team agreement on decision (0.0=no consensus, 1.0=complete consensus)';
COMMENT ON COLUMN outcome_tracking.ai_accuracy_validation IS 'Was AI classification accurate for this decision?';

-- Validation queries (commented out for production)
-- SELECT column_name, data_type, column_default, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'customer_decisions'
-- AND column_name LIKE '%customer%' OR column_name LIKE '%urgency%' OR column_name LIKE '%impact%'
-- ORDER BY ordinal_position;

-- SELECT type_code, type_name, typical_resolution_time_hours, requires_escalation
-- FROM customer_response_types
-- ORDER BY type_name;
