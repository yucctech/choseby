# Customer Response Platform: Database Schema
## PostgreSQL Implementation-Ready Schema

### 🎯 **OVERVIEW**
Complete database schema for Customer Response Decision Intelligence platform. This schema is designed for PostgreSQL and ready for immediate implementation by Claude Code.

---

## 📋 **CORE TABLES**

### Teams Table
```sql
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    team_size INTEGER DEFAULT 5,
    subscription_tier VARCHAR(20) DEFAULT 'starter' 
        CHECK (subscription_tier IN ('starter', 'professional', 'enterprise')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Team Members Table
```sql
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'customer_success_manager', 
        'support_manager', 
        'account_manager', 
        'sales_manager', 
        'legal_compliance', 
        'operations_manager'
    )),
    expertise_areas TEXT[],
    escalation_authority INTEGER DEFAULT 1 CHECK (escalation_authority BETWEEN 1 AND 5),
    notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Customer Decisions Table
```sql
CREATE TABLE customer_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES team_members(id),
    
    -- Customer Context
    customer_name VARCHAR(255) NOT NULL,
    customer_id VARCHAR(100),
    customer_email VARCHAR(255),
    customer_tier VARCHAR(20) DEFAULT 'standard' 
        CHECK (customer_tier IN ('basic', 'standard', 'premium', 'enterprise')),
    customer_value DECIMAL(12,2),
    relationship_duration_months INTEGER DEFAULT 0,
    
    -- Decision Details
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    decision_type VARCHAR(50) NOT NULL CHECK (decision_type IN (
        'refund_request', 
        'billing_dispute', 
        'service_escalation', 
        'policy_exception', 
        'contract_modification', 
        'churn_prevention'
    )),
    urgency_level INTEGER NOT NULL DEFAULT 3 CHECK (urgency_level BETWEEN 1 AND 5),
    financial_impact DECIMAL(12,2),
    
    -- Workflow Status
    status VARCHAR(20) DEFAULT 'created' CHECK (status IN (
        'created', 
        'team_input', 
        'evaluating', 
        'resolved', 
        'cancelled'
    )),
    current_phase INTEGER DEFAULT 1 CHECK (current_phase BETWEEN 1 AND 6),
    expected_resolution_date TIMESTAMP,
    actual_resolution_date TIMESTAMP,
    
    -- AI Analysis
    ai_classification JSONB,
    ai_recommendations JSONB,
    ai_confidence_score DECIMAL(3,2),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Decision Criteria Table
```sql
CREATE TABLE decision_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID NOT NULL REFERENCES customer_decisions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    weight DECIMAL(3,2) DEFAULT 1.0 CHECK (weight BETWEEN 0.1 AND 5.0),
    created_by UUID NOT NULL REFERENCES team_members(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Response Options Table
```sql
CREATE TABLE response_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID NOT NULL REFERENCES customer_decisions(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    financial_cost DECIMAL(12,2) DEFAULT 0,
    implementation_effort VARCHAR(20) DEFAULT 'medium' 
        CHECK (implementation_effort IN ('low', 'medium', 'high')),
    risk_level VARCHAR(20) DEFAULT 'medium' 
        CHECK (risk_level IN ('low', 'medium', 'high')),
    ai_generated BOOLEAN DEFAULT false,
    created_by UUID REFERENCES team_members(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Evaluations Table
```sql
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID NOT NULL REFERENCES customer_decisions(id) ON DELETE CASCADE,
    evaluator_id UUID NOT NULL REFERENCES team_members(id),
    option_id UUID NOT NULL REFERENCES response_options(id),
    criteria_id UUID NOT NULL REFERENCES decision_criteria(id),
    score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 10),
    confidence INTEGER DEFAULT 5 CHECK (confidence BETWEEN 1 AND 5),
    anonymous_comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(decision_id, evaluator_id, option_id, criteria_id)
);
```

### Decision Outcomes Table
```sql
CREATE TABLE decision_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID NOT NULL REFERENCES customer_decisions(id) ON DELETE CASCADE,
    selected_option_id UUID NOT NULL REFERENCES response_options(id),
    response_sent_at TIMESTAMP,
    customer_satisfaction_score INTEGER CHECK (customer_satisfaction_score BETWEEN 1 AND 10),
    escalation_occurred BOOLEAN DEFAULT false,
    resolution_time_hours INTEGER,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date TIMESTAMP,
    outcome_notes TEXT,
    financial_impact_actual DECIMAL(12,2),
    customer_retained BOOLEAN,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Authentication Tokens Table
```sql
CREATE TABLE auth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Audit Logs Table
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID REFERENCES customer_decisions(id),
    user_id UUID REFERENCES team_members(id),
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔍 **PERFORMANCE INDEXES**

```sql
-- Primary performance indexes
CREATE INDEX idx_customer_decisions_team_id ON customer_decisions(team_id);
CREATE INDEX idx_customer_decisions_status ON customer_decisions(status);
CREATE INDEX idx_customer_decisions_urgency ON customer_decisions(urgency_level, created_at);
CREATE INDEX idx_customer_decisions_customer ON customer_decisions(customer_name, customer_tier);
CREATE INDEX idx_evaluations_decision ON evaluations(decision_id);
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_audit_logs_decision ON audit_logs(decision_id, created_at);

-- Customer response specific indexes
CREATE INDEX idx_decisions_urgent ON customer_decisions(urgency_level, status) 
    WHERE urgency_level >= 4;
CREATE INDEX idx_decisions_pending_evaluation ON customer_decisions(status, created_at) 
    WHERE status = 'team_input';
CREATE INDEX idx_outcomes_satisfaction ON decision_outcomes(customer_satisfaction_score, created_at);
```

---

## 📊 **SAMPLE DATA INSERTS**

```sql
-- Sample team
INSERT INTO teams (id, name, company_name, industry) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Customer Success Team', 'TechCorp Inc', 'SaaS');

-- Sample team members
INSERT INTO team_members (id, team_id, email, name, password_hash, role) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'sarah@techcorp.com', 'Sarah Johnson', '$2b$10$hash1', 'customer_success_manager'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'mike@techcorp.com', 'Mike Chen', '$2b$10$hash2', 'support_manager'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'lisa@techcorp.com', 'Lisa Rodriguez', '$2b$10$hash3', 'account_manager');

-- Sample customer decision
INSERT INTO customer_decisions (
    id, team_id, created_by, customer_name, customer_email, customer_tier, 
    customer_value, title, description, decision_type, urgency_level
) VALUES (
    '550e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440001',
    'ABC Corporation',
    'john@abccorp.com',
    'enterprise',
    120000.00,
    'Refund Request for Service Outage',
    'Customer demanding full refund due to 8-hour service outage affecting their business operations',
    'refund_request',
    4
);
```

---

## ✅ **VALIDATION QUERIES**

```sql
-- Verify schema creation
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check constraints
SELECT conname, contype FROM pg_constraint 
WHERE conrelid = 'customer_decisions'::regclass;

-- Test relationships
SELECT 
    cd.title,
    tm.name as created_by,
    t.name as team_name
FROM customer_decisions cd
JOIN team_members tm ON cd.created_by = tm.id
JOIN teams t ON cd.team_id = t.id;
```

**Status**: Ready for implementation by Claude Code
**Next**: API endpoint specifications