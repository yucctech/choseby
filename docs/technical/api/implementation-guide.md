# API Implementation Guide

## Database Schema Requirements

### Core Tables (Based on Validated User Flows)

```sql
-- Teams table with HIPAA compliance settings
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) CHECK (status IN ('draft', 'in_progress', 'completed', 'archived', 'emergency')),
    workflow_type VARCHAR(50) CHECK (workflow_type IN ('emergency', 'express', 'full_decide')),
    current_phase INTEGER CHECK (current_phase BETWEEN 1 AND 6) DEFAULT 1, -- ✅ ADDED: Tracks DECIDE workflow progression
    decision_type VARCHAR(50) CHECK (decision_type IN ('vendor_selection', 'hiring', 'strategic', 'budget', 'compliance', 'clinical')),
    urgency VARCHAR(20) CHECK (urgency IN ('low', 'normal', 'high', 'emergency')),
    patient_impact VARCHAR(20) CHECK (patient_impact IN ('none', 'low', 'medium', 'high')),
    budget_min DECIMAL(12,2),
    budget_max DECIMAL(12,2),
    regulatory_deadline TIMESTAMPTZ,
    implementation_deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ✅ MIGRATION NOTE: The current_phase column was added via migration script backend/scripts/add_current_phase.go
-- This column is critical for IMPLEMENTATION PHASE 1 workflow tracking (6 DECIDE phases)
-- Migration SQL: ALTER TABLE decisions ADD COLUMN IF NOT EXISTS current_phase INTEGER DEFAULT 1 CHECK (current_phase >= 1 AND current_phase <= 6);

-- Decision criteria with AI suggestion tracking
CREATE TABLE decision_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID REFERENCES decisions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) NOT NULL, -- For participation tracking only
    overall_confidence DECIMAL(3,1) CHECK (overall_confidence >= 1 AND overall_confidence <= 10),
    evaluation_notes TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(decision_id, user_id) -- One evaluation per user per decision
);

-- Anonymous evaluation scores (separate for anonymity)
CREATE TABLE evaluation_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
    option_id UUID REFERENCES decision_options(id) NOT NULL,
    criterion_id UUID REFERENCES decision_criteria(id) NOT NULL,
    score DECIMAL(3,1) CHECK (score >= 1 AND score <= 10),
    rationale TEXT, -- Required for extreme scores
    confidence DECIMAL(3,1) CHECK (confidence >= 1 AND confidence <= 10),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```
## Conflict Detection Algorithm

```sql
-- Conflict detection view for real-time analysis
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
```

## Authentication Implementation

### JWT Token Structure
```javascript
// JWT Payload
{
  "sub": "user_id",
  "email": "dr.smith@hospital.com",
  "role": "physician",
  "teams": ["team_id_1", "team_id_2"],
  "permissions": ["create_decisions", "evaluate_options", "facilitate_meetings"],
  "iat": 1642781234,
  "exp": 1642784834
}
```

### SSO Integration Points
```javascript
// Healthcare SSO providers configuration
const ssoProviders = {
  epic: {
    authUrl: 'https://fhir.epic.com/oauth2/authorize',
    tokenUrl: 'https://fhir.epic.com/oauth2/token',
    userInfoUrl: 'https://fhir.epic.com/oauth2/userinfo',
    scopes: ['openid', 'profile', 'email', 'fhir_user']
  },
  cerner: {
    authUrl: 'https://authorization.cerner.com/oauth2/authorize',
    tokenUrl: 'https://authorization.cerner.com/oauth2/token',
    userInfoUrl: 'https://authorization.cerner.com/oauth2/userinfo',
    scopes: ['openid', 'profile', 'email', 'user/Patient.read']
  }
};
```

## Workflow State Machine

### Decision Workflow States
```javascript
const workflowStates = {
  emergency: {
    phases: [
      { id: 1, name: 'emergency_declaration', required: true },
      { id: 2, name: 'rapid_evaluation', required: true },
      { id: 3, name: 'immediate_implementation', required: true },
      { id: 4, name: 'retrospective_documentation', required: true, deadline: '48 hours' }
    ]
  },
  express: {
    phases: [
      { id: 1, name: 'define_and_evaluate', required: true },
      { id: 2, name: 'decide_and_document', required: true },
      { id: 3, name: 'implement_and_monitor', required: true }
    ]
  },
  full_decide: {
    phases: [
      { id: 1, name: 'define_problem', required: true },
      { id: 2, name: 'establish_criteria', required: true },
      { id: 3, name: 'consider_options', required: true },
      { id: 4, name: 'identify_best', required: true },
      { id: 5, name: 'develop_action', required: true },
      { id: 6, name: 'evaluate_monitor', required: true }
    ]
  }
};
```

## Real-time Collaboration (WebSocket Events)

### Event Types
```javascript
// WebSocket event definitions
const wsEvents = {
  // Team-level events
  TEAM_MEMBER_JOINED: 'team:member_joined',
  TEAM_MEMBER_LEFT: 'team:member_left',
  
  // Decision-level events
  DECISION_CREATED: 'decision:created',
  DECISION_UPDATED: 'decision:updated',
  PHASE_COMPLETED: 'decision:phase_completed',
  
  // Evaluation events
  EVALUATION_SUBMITTED: 'evaluation:submitted',
  EVALUATION_PROGRESS: 'evaluation:progress_updated',
  
  // Conflict events
  CONFLICT_DETECTED: 'conflict:detected',
  CONFLICT_RESOLVED: 'conflict:resolved',
  
  // Notification events
  DEADLINE_APPROACHING: 'notification:deadline_approaching',
  ESCALATION_TRIGGERED: 'notification:escalation_triggered'
};
```
## API Endpoint Implementation Examples

### Decision Creation with Workflow Determination
```javascript
// POST /teams/{teamId}/decisions
const determineWorkflowType = (decision) => {
  // Emergency criteria
  if (decision.urgency === 'emergency' || 
      decision.patient_impact === 'high' ||
      (decision.regulatory_deadline && 
       new Date(decision.regulatory_deadline) - new Date() < 24 * 60 * 60 * 1000)) {
    return 'emergency';
  }
  
  // Express criteria
  if (decision.budget_max < 10000 && 
      decision.estimated_duration_days < 14 &&
      decision.patient_impact === 'none') {
    return 'express';
  }
  
  // Default to full DECIDE workflow
  return 'full_decide';
};
```

### Anonymous Evaluation Processing
```javascript
// POST /teams/{teamId}/decisions/{decisionId}/evaluations
const processAnonymousEvaluation = async (evaluation) => {
  // Store evaluation with user ID for participation tracking
  const evaluationRecord = await db.evaluations.create({
    decision_id: evaluation.decision_id,
    user_id: evaluation.user_id,
    overall_confidence: evaluation.overall_confidence,
    evaluation_notes: evaluation.evaluation_notes
  });
  
  // Store scores separately for anonymity
  for (const optionEval of evaluation.evaluations) {
    for (const criterionScore of optionEval.criterion_scores) {
      await db.evaluation_scores.create({
        evaluation_id: evaluationRecord.id,
        option_id: optionEval.option_id,
        criterion_id: criterionScore.criterion_id,
        score: criterionScore.score,
        rationale: criterionScore.rationale,
        confidence: criterionScore.confidence
      });
    }
  }
  
  // Check for conflicts after new evaluation
  await checkConflicts(evaluation.decision_id);
  
  // Update team completion status
  await updateTeamProgress(evaluation.decision_id);
};
```

### Conflict Detection Implementation
```javascript
const checkConflicts = async (decisionId) => {
  const conflicts = await db.query(`
    SELECT
      option_id,
      criterion_id,
      STDDEV(score) as variance,
      COUNT(*) as evaluation_count
    FROM evaluation_scores es
    JOIN evaluations e ON es.evaluation_id = e.id
    WHERE e.decision_id = $1
    GROUP BY option_id, criterion_id
    HAVING COUNT(*) >= 2 AND STDDEV(score) > 2.5
  `, [decisionId]);

  for (const conflict of conflicts) {
    await createConflictRecord(conflict);
    await notifyFacilitator(decisionId, conflict);
  }
};
```

## ✅ IMPLEMENTATION PHASE 1: API Endpoints Implemented

### Decision Management Endpoints (handlers.go)

**GET /api/v1/teams/:teamId/decisions/:decisionId** - ✅ IMPLEMENTED
```go
// handlers.go lines 239-283
func (h *DecisionHandler) GetDecision(c *gin.Context) {
    decisionID := c.Param("decisionId")

    var decision struct {
        ID             string    `db:"id"`
        TeamID         string    `db:"team_id"`
        Title          string    `db:"title"`
        Description    string    `db:"description"`
        DecisionType   string    `db:"decision_type"`
        Status         string    `db:"status"`
        Priority       string    `db:"priority"`
        CurrentPhase   int       `db:"current_phase"`  // ✅ TRACKS WORKFLOW PROGRESSION
        CreatedAt      time.Time `db:"created_at"`
        UpdatedAt      time.Time `db:"updated_at"`
    }

    err := h.db.QueryRow(`
        SELECT id, team_id, title, description, decision_type, status, priority,
               COALESCE(current_phase, 1) as current_phase, created_at, updated_at
        FROM decisions
        WHERE id = $1
    `, decisionID).Scan(
        &decision.ID, &decision.TeamID, &decision.Title, &decision.Description,
        &decision.DecisionType, &decision.Status, &decision.Priority,
        &decision.CurrentPhase, &decision.CreatedAt, &decision.UpdatedAt,
    )

    if err != nil {
        log.Printf("GetDecision error for decision %s: %v", decisionID, err)
        c.JSON(http.StatusNotFound, gin.H{"error": "Decision not found"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "id":             decision.ID,
        "team_id":        decision.TeamID,
        "title":          decision.Title,
        "description":    decision.Description,
        "decision_type":  decision.DecisionType,
        "status":         decision.Status,
        "priority":       decision.Priority,
        "current_phase":  decision.CurrentPhase,
        "created_at":     decision.CreatedAt,
        "updated_at":     decision.UpdatedAt,
    })
}
```
**Bug Fixes**: Removed non-existent `created_by` field that caused 404 errors. Added error logging with `log.Printf()` for debugging.

**PUT /api/v1/teams/:teamId/decisions/:decisionId** - ✅ IMPLEMENTED
- Updates decision with partial field support using COALESCE
- Phase progression tracking via current_phase field
- Used by all 6 workflow screens to advance through DECIDE phases

**GET /api/v1/teams/:teamId/decisions/:decisionId/criteria** - ✅ IMPLEMENTED
**POST /api/v1/teams/:teamId/decisions/:decisionId/criteria** - ✅ IMPLEMENTED
- Full CRUD for evaluation criteria management
- Used by Phase 2: Establish Criteria screen

**GET /api/v1/teams/:teamId/decisions/:decisionId/options** - ✅ IMPLEMENTED
**POST /api/v1/teams/:teamId/decisions/:decisionId/options** - ✅ IMPLEMENTED
- Full CRUD for decision options management
- Used by Phase 3: Consider Options screen

### Frontend API Integration Fixed
All workflow screens now correctly use teamId parameter:
```typescript
// Before (BROKEN):
apiClient.updateDecision(decision.id, { current_phase: X })

// After (FIXED):
apiClient.updateDecision(decision.team_id, decision.id, { current_phase: X })
```

Files updated:
- DefineProblem.tsx:78
- EstablishCriteria.tsx:87
- ConsiderOptions.tsx:105
- AnonymousEvaluation.tsx:72
- ActionPlanning.tsx:44

## Healthcare Compliance Features

### HIPAA Audit Trail
```javascript
// Audit trail middleware
const auditTrail = (req, res, next) => {
  const auditData = {
    user_id: req.user.id,
    action: `${req.method} ${req.path}`,
    ip_address: req.ip,
    user_agent: req.get('User-Agent'),
    timestamp: new Date(),
    resource_id: req.params.decisionId || req.params.teamId,
    success: null, // Set after response
    error_message: null
  };
  
  res.on('finish', () => {
    auditData.success = res.statusCode < 400;
    if (!auditData.success) {
      auditData.error_message = res.locals.errorMessage;
    }
    db.audit_log.create(auditData);
  });
  
  next();
};
```

### Role-Based Access Control
```javascript
const checkPermissions = (requiredPermission) => {
  return async (req, res, next) => {
    const teamMember = await db.team_members.findOne({
      where: {
        team_id: req.params.teamId,
        user_id: req.user.id
      }
    });
    
    if (!teamMember || !teamMember.permissions.includes(requiredPermission)) {
      return res.status(403).json({
        error: 'insufficient_permissions',
        message: `Permission '${requiredPermission}' required`
      });
    }
    
    req.teamMember = teamMember;
    next();
  };
};
```
## Deployment Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/choseby_prod
DATABASE_POOL_SIZE=20

# Redis Cache
REDIS_URL=redis://localhost:6379
REDIS_TTL_DEFAULT=900

# Authentication
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRATION=3600
REFRESH_TOKEN_EXPIRATION=604800

# Healthcare SSO
EPIC_CLIENT_ID=your-epic-client-id
EPIC_CLIENT_SECRET=your-epic-client-secret
CERNER_CLIENT_ID=your-cerner-client-id
CERNER_CLIENT_SECRET=your-cerner-client-secret

# API Configuration
API_RATE_LIMIT=1000
API_RATE_WINDOW=3600000
CORS_ORIGINS=https://app.choseby.com,https://staging.choseby.com

# Healthcare Compliance
HIPAA_ENCRYPTION_KEY=your-encryption-key
AUDIT_RETENTION_YEARS=7
DATA_EXPORT_ENCRYPTION=true

# WebSocket Configuration
WS_MAX_CONNECTIONS=1000
WS_HEARTBEAT_INTERVAL=30000

# AI Integration
DEEPSEEK_API_KEY=your-deepseek-api-key
DEEPSEEK_MODEL=deepseek-r1
AI_TIMEOUT_MS=10000
```

### Docker Configuration
```dockerfile
# Multi-stage production build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS production
WORKDIR /app

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy application files
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Set permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: choseby-api
  namespace: choseby-prod
spec:
  replicas: 3
  selector:
    matchLabels:
      app: choseby-api
  template:
    metadata:
      labels:
        app: choseby-api
    spec:
      containers:
      - name: api
        image: choseby/api:v1.0.0
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: choseby-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: choseby-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## Monitoring and Alerting

### Health Check Endpoints
```javascript
// Health check implementation
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {}
  };
  
  try {
    // Database connectivity
    await db.sequelize.authenticate();
    health.services.database = 'healthy';
  } catch (error) {
    health.services.database = 'unhealthy';
    health.status = 'degraded';
  }
  
  try {
    // Redis connectivity
    await redis.ping();
    health.services.redis = 'healthy';
  } catch (error) {
    health.services.redis = 'unhealthy';
    health.status = 'degraded';
  }
  
  // Check WebSocket connections
  health.services.websockets = {
    status: 'healthy',
    active_connections: wsServer.clients.size
  };
  
  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

### Metrics Collection
```javascript
// Prometheus metrics
const prometheus = require('prom-client');

const metrics = {
  httpRequests: new prometheus.Counter({
    name: 'choseby_http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status']
  }),
  
  decisionCreations: new prometheus.Counter({
    name: 'choseby_decisions_created_total',
    help: 'Total number of decisions created',
    labelNames: ['team_id', 'workflow_type']
  }),
  
  evaluationSubmissions: new prometheus.Counter({
    name: 'choseby_evaluations_submitted_total',
    help: 'Total number of evaluations submitted',
    labelNames: ['team_id', 'decision_id']
  }),
  
  conflictsDetected: new prometheus.Counter({
    name: 'choseby_conflicts_detected_total',
    help: 'Total number of conflicts detected',
    labelNames: ['team_id', 'severity']
  }),
  
  websocketConnections: new prometheus.Gauge({
    name: 'choseby_websocket_connections',
    help: 'Number of active WebSocket connections'
  })
};
```

## Security Implementation

### Input Validation
```javascript
const { body, param, query, validationResult } = require('express-validator');

// Decision creation validation
const validateDecisionCreation = [
  body('title')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('decision_type')
    .isIn(['vendor_selection', 'hiring', 'strategic', 'budget', 'compliance', 'clinical'])
    .withMessage('Invalid decision type'),
  body('urgency')
    .isIn(['low', 'normal', 'high', 'emergency'])
    .withMessage('Invalid urgency level'),
  body('patient_impact')
    .isIn(['none', 'low', 'medium', 'high'])
    .withMessage('Invalid patient impact level'),
  body('budget_range.min')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget minimum must be a positive number'),
  body('budget_range.max')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget maximum must be a positive number')
    .custom((value, { req }) => {
      if (req.body.budget_range?.min && value < req.body.budget_range.min) {
        throw new Error('Budget maximum must be greater than minimum');
      }
      return true;
    })
];
```

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

// API rate limiting
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    error: 'rate_limit_exceeded',
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter limits for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  skipSuccessfulRequests: true
});
```

## Documentation Generation

### Swagger UI Setup
```javascript
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const swaggerDocument = YAML.load('./docs/technical/api/openapi-specification.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Choseby Healthcare API Documentation',
  customfavIcon: '/favicon.ico'
}));
```

---

## Implementation Phases

### Phase 1: Core API (Weeks 1-2)
- [ ] Database schema implementation
- [ ] Authentication and authorization
- [ ] Team and user management endpoints
- [ ] Basic decision creation and management
- [ ] Anonymous evaluation system
- [ ] Conflict detection algorithms

### Phase 2: Workflows (Weeks 3-4)
- [ ] Emergency decision workflow
- [ ] Express decision workflow
- [ ] Full DECIDE workflow implementation
- [ ] Phase progression logic
- [ ] Professional documentation generation

### Phase 3: Advanced Features (Weeks 5-8)
- [ ] WebSocket real-time collaboration
- [ ] AI integration for criteria suggestions
- [ ] Analytics and reporting endpoints
- [ ] Healthcare system integrations
- [ ] Mobile optimization

### Phase 4: Production Readiness
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Monitoring and alerting
- [ ] Load testing
- [ ] HIPAA compliance audit

---

---

## Data Validation Rules & TypeScript Interfaces

### DECIDE Framework Phase Validation
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
      }
    }
  }
  
  phase_3_consider: {
    name: "Consider Alternatives"
    required_fields: ['alternatives']
    validation_rules: {
      min_alternatives: 2
      max_alternatives: 8
      each_alternative: {
        name: { min_length: 5, max_length: 100 }
        description: { min_length: 50, max_length: 1000 }
        feasibility_score: { min: 1, max: 10 }
      }
    }
  }
  
  phase_4_identify: {
    name: "Anonymous Evaluation"
    required_fields: ['individual_evaluations']
    validation_rules: {
      evaluation_completeness: "All team members must evaluate all alternatives against all criteria"
      anonymity_preservation: "No user attribution stored with evaluations"
      conflict_detection: "Variance > 2.5 triggers conflict resolution workflow"
    }
  }
  
  phase_5_develop: {
    name: "Develop Action Plan"
    required_fields: ['implementation_plan', 'timeline', 'responsibilities']
    validation_rules: {
      timeline: { min_duration_days: 1, max_duration_days: 365 }
      responsibilities: { min_assignees: 1, all_assignees_must_be_team_members: true }
    }
  }
  
  phase_6_evaluate: {
    name: "Evaluate & Monitor"
    required_fields: ['success_metrics', 'review_schedule']
    validation_rules: {
      success_metrics: { min_count: 1, max_count: 10 }
      review_schedule: { next_review_within_90_days: true }
    }
  }
}
```

### Real-time Validation Rules
```typescript
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
  
  healthcare_specific_validation: {
    patient_impact_assessment: {
      required_for_clinical_decisions: true
      impact_levels: ["none", "low", "medium", "high", "critical"]
      documentation_requirements: {
        high_impact: "Detailed rationale required"
        critical_impact: "Medical director approval required"
      }
    }
    
    regulatory_compliance: {
      joint_commission_flagging: "Flag decisions affecting accreditation"
      cms_compliance_check: "Verify Medicare/Medicaid impact documentation"
      hipaa_considerations: "Ensure no PHI in decision documentation"
    }
  }
}
```

### Healthcare Team Validation
```typescript
interface HealthcareTeamValidation {
  team_composition: {
    min_members: 3
    max_members: 8
    role_diversity_requirements: {
      clinical_representation: "At least 1 clinical role required"
      administrative_balance: "Max 50% administrative roles"
      experience_distribution: "Mix of experience levels recommended"
    }
  }
  
  member_validation: {
    email_domain_verification: {
      healthcare_domains: ["*.health.org", "*.hospital.com", "*.clinic.net"]
      validation_method: "DNS MX record check + domain reputation"
    }
    
    role_assignments: {
      clinical_lead: { requires_license_verification: false } // MVP: Trust-based
      admin: { requires_organization_approval: true }
      member: { default_role: true, no_special_requirements: true }
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
  }
}
```

### Conflict Detection Algorithms
```typescript
interface ConflictDetectionSystem {
  variance_calculation: {
    method: "standard_deviation"
    threshold: 2.5
    minimum_evaluations: 3
    real_time_processing: true
  }
  
  conflict_types: {
    high_variance: "Individual scores vary significantly (>2.5 SD)"
    polarization: "Clear faction divisions in team evaluations"
    outlier_detection: "Individual consistently scoring differently from team"
    criteria_confusion: "High variance suggests criteria misunderstanding"
  }
  
  resolution_triggers: {
    automatic_facilitation: "System suggests discussion topics"
    expert_escalation: "Flag for medical director review if patient safety involved"
    consensus_building: "Guided team discussion workflows"
  }
}
```

---

**Implementation Priority**: Begin with Phase 1 core API development using this technical specification and the validated user flows. Focus on healthcare team onboarding and basic decision workflows to achieve $500+ MRR target by Week 8.