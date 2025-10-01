-- Migration: Add Response Drafts and Outcome Tracking Enhancements
-- Week 1, Day 4: AI Response Draft Generation & Outcome Analysis Foundation
-- Applied: 2025-01-08

-- Response Drafts Table (AI-generated customer responses)
CREATE TABLE IF NOT EXISTS response_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID NOT NULL REFERENCES customer_decisions(id) ON DELETE CASCADE,
    draft_content TEXT NOT NULL,
    tone VARCHAR(50) NOT NULL CHECK (tone IN ('professional_empathetic', 'formal_corporate', 'friendly_apologetic', 'concise_factual')),
    key_points TEXT[] NOT NULL DEFAULT '{}',
    estimated_satisfaction_impact VARCHAR(20) CHECK (estimated_satisfaction_impact IN ('very_positive', 'positive', 'neutral', 'negative', 'very_negative')),
    follow_up_recommendations TEXT[] DEFAULT '{}',
    version INTEGER NOT NULL DEFAULT 1,
    created_by UUID NOT NULL REFERENCES team_members(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Metadata for regeneration and tracking
    generation_metadata JSONB,
    based_on_option_id UUID REFERENCES response_options(id),
    team_consensus_score DECIMAL(3,2)
);

-- AI Recommendation Feedback (Link recommendations to outcomes)
CREATE TABLE IF NOT EXISTS ai_recommendation_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID NOT NULL REFERENCES customer_decisions(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL CHECK (recommendation_type IN ('classification', 'stakeholder_suggestion', 'response_draft', 'risk_assessment')),
    ai_suggestion TEXT NOT NULL,
    stakeholder_approval_rating INTEGER CHECK (stakeholder_approval_rating >= 1 AND stakeholder_approval_rating <= 5),
    final_decision_alignment BOOLEAN DEFAULT FALSE,
    accuracy_score DECIMAL(3,2),
    improvement_suggestions TEXT,
    ai_confidence_score DECIMAL(3,2),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_response_drafts_decision_id ON response_drafts(decision_id);
CREATE INDEX IF NOT EXISTS idx_response_drafts_created_at ON response_drafts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_response_drafts_version ON response_drafts(decision_id, version DESC);

CREATE INDEX IF NOT EXISTS idx_ai_feedback_decision_id ON ai_recommendation_feedback(decision_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_recommendation_type ON ai_recommendation_feedback(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_alignment ON ai_recommendation_feedback(final_decision_alignment, created_at);

-- Add audit fields to outcome_tracking table
ALTER TABLE outcome_tracking
    ADD COLUMN IF NOT EXISTS ai_classification_accurate BOOLEAN,
    ADD COLUMN IF NOT EXISTS response_draft_used BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS response_draft_version INTEGER;

-- Comments for documentation
COMMENT ON TABLE response_drafts IS 'AI-generated customer response drafts with versioning and tone customization';
COMMENT ON TABLE ai_recommendation_feedback IS 'Track AI recommendation accuracy and effectiveness for continuous improvement';
COMMENT ON COLUMN response_drafts.tone IS 'Communication tone: professional_empathetic, formal_corporate, friendly_apologetic, concise_factual';
COMMENT ON COLUMN response_drafts.version IS 'Draft version number for regeneration tracking';
COMMENT ON COLUMN response_drafts.team_consensus_score IS 'Team consensus score (0.0-1.0) at time of draft generation';
