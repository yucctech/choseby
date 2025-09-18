-- CHOSEBY HEALTHCARE DECISION PLATFORM DATABASE SCHEMA
-- Go Backend Implementation
-- HIPAA-compliant with audit trails and anonymous evaluation support

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teams table with HIPAA compliance settings
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    organization VARCHAR(200),
    industry VARCHAR(50) DEFAULT 'healthcare',
    compliance_requirements JSONB DEFAULT '{"hipaa": true, "joint_commission": true, "patient_safety": true}',
    settings JSONB DEFAULT '{"evaluation_timeout_hours": 72, "conflict_threshold": 2.5}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users with healthcare-specific roles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('physician', 'nurse', 'administrator', 'technician', 'pharmacist', 'other')),
    department VARCHAR(100),
    license_number VARCHAR(50), -- For audit trails
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- Team membership with role-based permissions
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) CHECK (role IN ('member', 'facilitator', 'administrator', 'observer')),
    permissions TEXT[] DEFAULT ARRAY['evaluate_options', 'view_decisions'],
    primary_backup UUID REFERENCES users(id), -- Staff turnover protection
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Decisions with workflow type determination
CREATE TABLE decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) CHECK (status IN ('draft', 'in_progress', 'completed', 'archived', 'emergency')),
    workflow_type VARCHAR(50) CHECK (workflow_type IN ('emergency', 'express', 'full_decide')),
    current_phase INTEGER CHECK (current_phase BETWEEN 1 AND 6) DEFAULT 1,
    decision_type VARCHAR(50) CHECK (decision_type IN ('vendor_selection', 'hiring', 'strategic', 'budget', 'compliance', 'clinical')),
    urgency VARCHAR(20) CHECK (urgency IN ('low', 'normal', 'high', 'emergency')),
    patient_impact VARCHAR(20) CHECK (patient_impact IN ('none', 'low', 'medium', 'high')),
    budget_min DECIMAL(12,2),
    budget_max DECIMAL(12,2),
    regulatory_deadline TIMESTAMPTZ,
    implementation_deadline TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Decision criteria with AI suggestion tracking
CREATE TABLE decision_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    decision_id UUID REFERENCES decisions(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    weight DECIMAL(5,2) CHECK (weight >= 0 AND weight <= 100),
    category VARCHAR(50) CHECK (category IN ('technical', 'financial', 'clinical', 'compliance', 'operational')),
    measurement_type VARCHAR(20) CHECK (measurement_type IN ('qualitative', 'quantitative', 'binary')),
    ai_suggested BOOLEAN DEFAULT FALSE,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Decision options
CREATE TABLE decision_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    decision_id UUID REFERENCES decisions(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    estimated_cost DECIMAL(12,2),
    implementation_timeline VARCHAR(100),
    vendor_info JSONB,
    feasibility_assessment JSONB,
    risk_factors TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Anonymous evaluations (core feature)
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    decision_id UUID REFERENCES decisions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) NOT NULL, -- For participation tracking only
    overall_confidence DECIMAL(3,1) CHECK (overall_confidence >= 1 AND overall_confidence <= 10),
    evaluation_notes TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(decision_id, user_id) -- One evaluation per user per decision
);

-- Anonymous evaluation scores (separate for anonymity)
CREATE TABLE evaluation_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
    option_id UUID REFERENCES decision_options(id) NOT NULL,
    criterion_id UUID REFERENCES decision_criteria(id) NOT NULL,
    score DECIMAL(3,1) CHECK (score >= 1 AND score <= 10),
    rationale TEXT, -- Required for extreme scores
    confidence DECIMAL(3,1) CHECK (confidence >= 1 AND confidence <= 10),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conflicts detected in evaluations
CREATE TABLE conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    decision_id UUID REFERENCES decisions(id) ON DELETE CASCADE,
    option_id UUID REFERENCES decision_options(id) NOT NULL,
    criterion_id UUID REFERENCES decision_criteria(id) NOT NULL,
    variance_score DECIMAL(5,2) NOT NULL,
    conflict_level VARCHAR(20) CHECK (conflict_level IN ('low', 'medium', 'high', 'critical')),
    resolution_status VARCHAR(20) CHECK (resolution_status IN ('unresolved', 'in_progress', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HIPAA-compliant audit trail
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_id UUID,
    resource_type VARCHAR(50),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT
);

-- Healthcare SSO sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    sso_provider VARCHAR(50),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed TIMESTAMPTZ DEFAULT NOW()
);

-- WebSocket connection tracking for real-time collaboration
CREATE TABLE websocket_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    connection_id VARCHAR(255) UNIQUE NOT NULL,
    connected_at TIMESTAMPTZ DEFAULT NOW(),
    last_ping TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) CHECK (status IN ('connected', 'disconnected')) DEFAULT 'connected'
);

-- Indexes for performance optimization
CREATE INDEX idx_teams_industry ON teams(industry);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_decisions_team_id ON decisions(team_id);
CREATE INDEX idx_decisions_status ON decisions(status);
CREATE INDEX idx_decisions_workflow_type ON decisions(workflow_type);
CREATE INDEX idx_decision_criteria_decision_id ON decision_criteria(decision_id);
CREATE INDEX idx_decision_options_decision_id ON decision_options(decision_id);
CREATE INDEX idx_evaluations_decision_id ON evaluations(decision_id);
CREATE INDEX idx_evaluations_user_id ON evaluations(user_id);
CREATE INDEX idx_evaluation_scores_evaluation_id ON evaluation_scores(evaluation_id);
CREATE INDEX idx_evaluation_scores_option_criterion ON evaluation_scores(option_id, criterion_id);
CREATE INDEX idx_conflicts_decision_id ON conflicts(decision_id);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX idx_websocket_connections_user_id ON websocket_connections(user_id);
CREATE INDEX idx_websocket_connections_team_id ON websocket_connections(team_id);

-- Views for common healthcare queries
CREATE VIEW evaluation_conflicts AS
SELECT
    es.option_id,
    es.criterion_id,
    do.name as option_name,
    dc.name as criterion_name,
    COUNT(*) as evaluation_count,
    AVG(es.score) as mean_score,
    STDDEV(es.score) as score_variance,
    CASE
        WHEN STDDEV(es.score) > 2.5 THEN 'high'
        WHEN STDDEV(es.score) > 1.5 THEN 'medium'
        WHEN STDDEV(es.score) > 0.5 THEN 'low'
        ELSE 'none'
    END as conflict_level
FROM evaluation_scores es
JOIN decision_options do ON es.option_id = do.id
JOIN decision_criteria dc ON es.criterion_id = dc.id
GROUP BY es.option_id, es.criterion_id, do.name, dc.name
HAVING COUNT(*) >= 2; -- Minimum 2 evaluations for conflict detection

-- Function for healthcare workflow determination
CREATE OR REPLACE FUNCTION determine_workflow_type(
    p_urgency VARCHAR,
    p_patient_impact VARCHAR,
    p_budget_max DECIMAL,
    p_regulatory_deadline TIMESTAMPTZ
) RETURNS VARCHAR AS $$
BEGIN
    -- Emergency criteria
    IF p_urgency = 'emergency' OR
       p_patient_impact = 'high' OR
       (p_regulatory_deadline IS NOT NULL AND
        p_regulatory_deadline - NOW() < INTERVAL '24 hours') THEN
        RETURN 'emergency';
    END IF;

    -- Express criteria
    IF p_budget_max < 10000 AND p_patient_impact = 'none' THEN
        RETURN 'express';
    END IF;

    -- Default to full DECIDE workflow
    RETURN 'full_decide';
END;
$$ LANGUAGE plpgsql;

-- Function to update team consensus levels
CREATE OR REPLACE FUNCTION update_team_consensus(decision_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_members INTEGER;
    completed_evaluations INTEGER;
    consensus_level DECIMAL;
BEGIN
    -- Count total team members
    SELECT COUNT(*) INTO total_members
    FROM team_members tm
    JOIN decisions d ON tm.team_id = d.team_id
    WHERE d.id = decision_id;

    -- Count completed evaluations
    SELECT COUNT(*) INTO completed_evaluations
    FROM evaluations e
    WHERE e.decision_id = decision_id;

    -- Calculate consensus level
    IF total_members > 0 THEN
        consensus_level := (completed_evaluations::DECIMAL / total_members::DECIMAL) * 100;
    ELSE
        consensus_level := 0;
    END IF;

    RETURN consensus_level;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically detect conflicts after evaluation submission
CREATE OR REPLACE FUNCTION detect_conflicts_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert conflicts for high variance scores
    INSERT INTO conflicts (decision_id, option_id, criterion_id, variance_score, conflict_level)
    SELECT
        e.decision_id,
        es.option_id,
        es.criterion_id,
        STDDEV(es.score),
        CASE
            WHEN STDDEV(es.score) > 2.5 THEN 'high'
            WHEN STDDEV(es.score) > 1.5 THEN 'medium'
            ELSE 'low'
        END
    FROM evaluation_scores es
    JOIN evaluations e ON es.evaluation_id = e.id
    WHERE e.decision_id = (SELECT decision_id FROM evaluations WHERE id = NEW.evaluation_id)
    GROUP BY e.decision_id, es.option_id, es.criterion_id
    HAVING COUNT(*) >= 2 AND STDDEV(es.score) > 1.5
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER evaluation_conflict_detection
    AFTER INSERT ON evaluation_scores
    FOR EACH ROW
    EXECUTE FUNCTION detect_conflicts_trigger();

-- Healthcare compliance validation
COMMENT ON TABLE teams IS 'Healthcare teams with HIPAA compliance settings';
COMMENT ON TABLE audit_log IS 'HIPAA-compliant audit trail for all system actions';
COMMENT ON TABLE evaluations IS 'Anonymous evaluations for conflict-free decision making';
COMMENT ON COLUMN users.license_number IS 'Professional license for healthcare audit trails';
COMMENT ON COLUMN decisions.patient_impact IS 'Patient safety impact assessment for healthcare workflows';