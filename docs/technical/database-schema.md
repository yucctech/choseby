# Database Schema - Team Decision Platform

## Overview
**Database**: Supabase PostgreSQL with Row Level Security (RLS)
**Multi-tenancy**: Team-based isolation using RLS policies
**Authentication**: Integrated with Supabase Auth

## Core Tables

### Teams
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Users (Managed by Supabase Auth)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Team Members with Roles
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