# Healthcare Decision Platform - Database Schema

## Overview
**Database**: Supabase PostgreSQL with HIPAA-compliant Row Level Security
**Multi-tenancy**: Team-based isolation for healthcare organizations
**Authentication**: Supabase Auth with role-based healthcare team access
**Compliance**: HIPAA audit trails, data retention, encryption at rest

## DECIDE Methodology Support (6-Phase Framework)
Based on research validation, the schema supports the DECIDE framework adapted for healthcare team collaboration rather than the original 7-phase proposal.

### Teams (Healthcare Organizations)
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  industry VARCHAR(50) NOT NULL DEFAULT 'healthcare' 
    CHECK (industry IN ('healthcare', 'professional_services', 'manufacturing', 'tech')),
  organization_size VARCHAR(20) CHECK (organization_size IN ('25-49', '50-99', '100-249')),
  compliance_requirements JSONB DEFAULT '{"hipaa": true, "joint_commission": false, "patient_safety": true}',
  subscription_tier VARCHAR(20) DEFAULT 'pilot' CHECK (subscription_tier IN ('pilot', 'standard', 'premium')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Healthcare-specific indexes
CREATE INDEX idx_teams_industry ON teams(industry);
CREATE INDEX idx_teams_compliance ON teams USING GIN (compliance_requirements);
```

### Users (Healthcare Team Members)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'facilitator', 'member', 'clinical_lead')),
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  department VARCHAR(50), -- Clinical, Administrative, IT, Compliance
  title VARCHAR(100),
  healthcare_role VARCHAR(50), -- Physician, Nurse, Administrator, etc.
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance and security indexes
CREATE INDEX idx_users_team_role ON users(team_id, role);
CREATE INDEX idx_users_active ON users(team_id) WHERE is_active = true;
```

### Decisions (DECIDE Methodology - 6 Phases)
```sql
CREATE TABLE decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  decision_type VARCHAR(50) NOT NULL 
    CHECK (decision_type IN ('vendor_selection', 'hiring', 'strategic', 'budget', 'compliance', 'clinical_protocol')),
  current_phase INTEGER NOT NULL CHECK (current_phase BETWEEN 1 AND 6) DEFAULT 1,
  status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'in_progress', 'completed', 'archived')) DEFAULT 'draft',
  created_by UUID REFERENCES users(id) NOT NULL,
  facilitator_id UUID REFERENCES users(id),
  due_date TIMESTAMP WITH TIME ZONE,
  priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  
  -- Healthcare-specific fields
  patient_impact_level VARCHAR(10) CHECK (patient_impact_level IN ('none', 'low', 'medium', 'high')) DEFAULT 'none',
  compliance_required BOOLEAN DEFAULT false,
  regulatory_deadline TIMESTAMP WITH TIME ZONE,
  estimated_budget DECIMAL(12,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Decision workflow optimization indexes
CREATE INDEX idx_decisions_team_status ON decisions(team_id, status);
CREATE INDEX idx_decisions_current_phase ON decisions(current_phase);
CREATE INDEX idx_decisions_patient_impact ON decisions(patient_impact_level) WHERE patient_impact_level != 'none';
```


### Decision Phases (DECIDE Methodology Storage)
```sql
CREATE TABLE decision_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID REFERENCES decisions(id) ON DELETE CASCADE NOT NULL,
  phase_number INTEGER NOT NULL CHECK (phase_number BETWEEN 1 AND 6),
  phase_name VARCHAR(50) NOT NULL, -- 'Define', 'Establish', 'Consider', 'Identify', 'Develop', 'Evaluate'
  phase_data JSONB NOT NULL DEFAULT '{}',
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES users(id),
  UNIQUE(decision_id, phase_number)
);

-- JSONB structure for phase data
/*
Phase 1 (Define Problem):
{
  "problem_statement": "string",
  "stakeholders": [{"name": "string", "role": "clinical|administrative|compliance", "influence": "high|medium|low"}],
  "success_criteria": ["string"],
  "constraints": [{"type": "regulatory|budget|timeline", "description": "string"}],
  "patient_impact": {"direct_impact": boolean, "risk_level": "none|low|medium|high"}
}

Phase 2 (Establish Criteria):
{
  "evaluation_criteria": [
    {
      "id": "uuid",
      "name": "string", 
      "description": "string",
      "weight": number,
      "category": "technical|financial|clinical|compliance",
      "healthcare_specific": boolean
    }
  ],
  "ai_generated": boolean
}

Phase 4 (Identify - Anonymous Evaluations):
{
  "evaluation_summary": {
    "total_evaluations": number,
    "consensus_level": number,
    "conflicts_detected": ["conflict_id"]
  }
}
*/

CREATE INDEX idx_decision_phases_lookup ON decision_phases(decision_id, phase_number);
```

### Anonymous Evaluations (Phase 4: Identify Best Alternative)
```sql
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID REFERENCES decisions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  evaluation_data JSONB NOT NULL,
  confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 10),
  bias_alerts JSONB DEFAULT '[]',
  rationale TEXT,
  time_spent_minutes INTEGER,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_anonymous BOOLEAN DEFAULT true,
  
  -- Ensure one evaluation per user per decision
  UNIQUE(decision_id, user_id)
);

-- Evaluation data structure
/*
{
  "option_scores": {"option_1_id": 8, "option_2_id": 6},
  "criteria_weights": {"criteria_1_id": 30, "criteria_2_id": 25},
  "weighted_totals": {"option_1_id": 7.2, "option_2_id": 6.8},
  "confidence_factors": {
    "data_quality": 8,
    "expertise_level": 7,
    "time_adequate": true
  }
}
*/

CREATE INDEX idx_evaluations_decision ON evaluations(decision_id);
```

### Conflict Detection and Resolution
```sql
CREATE TABLE conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID REFERENCES decisions(id) ON DELETE CASCADE NOT NULL,
  criteria_id VARCHAR(100), -- Which evaluation criteria shows conflict
  conflict_type VARCHAR(20) CHECK (conflict_type IN ('data', 'values', 'assumptions')) NOT NULL,
  severity VARCHAR(10) CHECK (severity IN ('low', 'medium', 'high')) NOT NULL,
  disagreement_score DECIMAL(3,2) CHECK (disagreement_score BETWEEN 0 AND 1),
  participants_count INTEGER NOT NULL,
  description TEXT,
  resolution_status VARCHAR(20) CHECK (resolution_status IN ('detected', 'in_progress', 'resolved')) DEFAULT 'detected',
  resolution_approach TEXT,
  facilitator_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


## Row Level Security (HIPAA Compliance)

### Enable RLS on All Tables
```sql
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conflicts ENABLE ROW LEVEL SECURITY;
```

### Team Data Isolation Policies
```sql
-- Users can only access their own team's data
CREATE POLICY "team_isolation_decisions" ON decisions
  FOR ALL USING (team_id IN (
    SELECT team_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "team_isolation_phases" ON decision_phases
  FOR ALL USING (decision_id IN (
    SELECT d.id FROM decisions d 
    JOIN users u ON d.team_id = u.team_id 
    WHERE u.id = auth.uid()
  ));

-- Anonymous evaluation protection - users can only see their own submissions
CREATE POLICY "own_evaluations_only" ON evaluations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "insert_own_evaluation" ON evaluations
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Facilitators can manage team decisions
CREATE POLICY "facilitator_decision_management" ON decisions
  FOR UPDATE USING (
    facilitator_id = auth.uid() OR 
    created_by = auth.uid() OR
    team_id IN (
      SELECT team_id FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'facilitator')
    )
  );
```

## API Endpoint Specifications

### Decision Management
```typescript
// Create new DECIDE workflow
POST /api/decisions
Body: {
  title: string
  description: string
  decision_type: 'vendor_selection' | 'hiring' | 'strategic' | 'budget' | 'compliance'
  facilitator_id?: string
  patient_impact_level: 'none' | 'low' | 'medium' | 'high'
  estimated_budget?: number
  regulatory_deadline?: string
}

// Get decision with all phases
GET /api/decisions/{id}
Response: {
  decision: Decision
  phases: DecisionPhase[]
  team_members: User[]
  evaluation_count: number
  conflicts: Conflict[]
}

// Update DECIDE phase data  
PUT /api/decisions/{id}/phases/{phase_number}
Body: { phase_data: PhaseData }

// Submit anonymous evaluation (Phase 4)
POST /api/decisions/{id}/evaluations
Body: {
  evaluation_data: {
    option_scores: Record<string, number>
    criteria_weights: Record<string, number>
    rationale: string
    confidence_level: number
  }
}
```

### Healthcare AI Integration
```typescript
// Generate healthcare decision criteria
POST /api/ai/generate-criteria
Body: {
  decision_type: string
  industry: 'healthcare'
  context: string
  compliance_requirements: string[]
}
Response: {
  criteria: Array<{
    name: string
    description: string
    weight: number
    healthcare_specific: boolean
  }>
  compliance_considerations: string[]
}
```
```
```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id),
  user_id UUID REFERENCES users(id),
  role VARCHAR(50) NOT NULL, -- 'admin', 'member', 'observer'
  expertise_area VARCHAR(100), -- 'CEO', 'CTO', 'Operations', etc.
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Decisions
```sql
CREATE TABLE decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'resolved', 'archived'
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Evaluation Criteria
```sql
CREATE TABLE criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID REFERENCES decisions(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  weight INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Anonymous Scores
```sql
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID REFERENCES decisions(id),
  criteria_id UUID REFERENCES criteria(id),
  user_id UUID REFERENCES users(id),
  score INTEGER NOT NULL, -- 1-5 or 1-10 scale
  rationale TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Conflicts Detection
```sql
CREATE TABLE conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID REFERENCES decisions(id),
  criteria_id UUID REFERENCES criteria(id),
  conflict_type VARCHAR(50), -- 'high_variance', 'opposing_views'
  description TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Row Level Security Policies

### Team Member Access Control
```sql
-- Users can only access teams they belong to
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_member_access" ON teams
  FOR ALL USING (
    id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );
```

### Private Score Protection
```sql
-- Users can only view/edit their own scores
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_scores_only" ON scores
  FOR ALL USING (user_id = auth.uid());
```

### Team Admin Access
```sql
-- Team admins can see all team data
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_admin_access" ON decisions
  FOR ALL USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

## Indexes for Performance
```sql
-- Team membership lookups
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);

-- Decision queries
CREATE INDEX idx_decisions_team_id ON decisions(team_id);
CREATE INDEX idx_decisions_status ON decisions(status);

-- Score aggregations
CREATE INDEX idx_scores_decision_id ON scores(decision_id);
CREATE INDEX idx_scores_criteria_id ON scores(criteria_id);
```

## Data Flow
1. **Team Creation**: Admin creates team, receives team_id
2. **Member Invitation**: Admin invites users, assigns roles and expertise areas
3. **Decision Creation**: Team member creates decision, defines criteria
4. **Anonymous Scoring**: Each member scores privately, rationale optional
5. **Conflict Detection**: System identifies disagreements, flags for resolution
6. **Resolution Tracking**: Team works through conflicts, marks resolved

## Free Tier Considerations
**Supabase FREE Tier**: 500MB database limit
**Estimated Capacity**: ~1000 teams, ~10,000 decisions, ~100,000 scores
**Monitoring**: Track usage via Supabase Dashboard
**Upgrade Trigger**: Approach 400MB usage → upgrade to Pro ($25/month)