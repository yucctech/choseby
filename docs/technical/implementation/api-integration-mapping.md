# API Integration Mapping - CHOSEBY Healthcare Decision Platform

**Purpose**: UX-optimized API specifications for component requirements  
**Context**: API redesign to support optimal healthcare user experience  
**Approach**: UX-first development - Update existing OpenAPI to match component needs

---

## 🔄 **UX-FIRST API STRATEGY**

### **Current State vs Required State**
- **Current**: API-constrained UX design (40+ endpoints, mobile-limited)
- **Required**: UX-optimized API design (component-driven endpoints)
- **Approach**: Redesign API to support optimal healthcare workflows

### **Core Philosophy Shift**
```yaml
# OLD APPROACH (API-First)
API Design → Frontend Constraints → Suboptimal UX

# NEW APPROACH (UX-First)  
Optimal UX → Component Requirements → API Redesign → Superior Healthcare Workflows
```

---

## 🧩 **COMPONENT-TO-API MAPPING**

### **1. DecisionProgressBar API Requirements**

**Required API Enhancements**:
```yaml
GET /decisions/{id}/phase-status:
  description: Get comprehensive phase status for healthcare workflows
  response:
    currentPhase: number
    completedPhases: number[]
    phaseValidation:
      canAdvance: boolean
      missingRequirements: string[]
      consensusLevel: number
      conflictAlerts: ConflictAlert[]
    teamReadiness:
      requiredParticipants: string[]
      currentParticipants: string[]
      quorumMet: boolean

PUT /decisions/{id}/advance-phase:
  description: Advance to next phase with healthcare-specific validation
  requestBody:
    targetPhase: number
    forceAdvance?: boolean
    override:
      reason: string
      overrideBy: string
      emergencyJustification?: string

WebSocket /decisions/{id}/phase-updates:
  events:
    - phase_advanced
    - validation_failed
    - conflict_detected
```

---

### **2. AnonymousEvaluationCard API Requirements**

**Required API Redesign**:
```yaml
POST /sessions/anonymous:
  description: Create anonymous evaluation session
  requestBody:
    teamId: string
    decisionId: string
    userRole: HealthcareRole
  response:
    sessionToken: string
    expiresAt: Date
    anonymityLevel: 'full' | 'role-based'

POST /evaluations/anonymous:
  description: Submit evaluation with anonymity guarantee
  requestBody:
    sessionToken: string
    evaluation:
      targetId: string
      evaluationType: 'alternative' | 'consequence' | 'value'
      score: number
      confidence: 'low' | 'medium' | 'high'

GET /evaluations/aggregated/{targetId}:
  description: Get anonymous aggregated evaluation results
  response:
    averageScore: number
    scoreDistribution: number[]
    consensusLevel: number
    conflictLevel: number
    participationRate: number

WebSocket /evaluations/conflicts/{decisionId}:
  events:
    - evaluation_submitted
    - conflict_detected
    - consensus_improved
```

---

### **3. ConflictIndicator API Requirements**

**Required API Enhancement**:
```yaml
GET /decisions/{id}/conflicts/detailed:
  description: Comprehensive conflict analysis for healthcare teams
  response:
    overallConflictLevel: number
    conflictBreakdown:
      byArea: ConflictArea[]
      byRole: Record<HealthcareRole, number>
    healthcareRiskAssessment:
      patientSafetyImpact: 'none' | 'low' | 'medium' | 'high' | 'critical'
      escalationRequired: boolean
    resolutionRecommendations:
      suggestedIntervention: string
      facilitationRequired: boolean

POST /conflicts/resolution/initiate:
  description: Start structured conflict resolution for healthcare
  requestBody:
    conflictId: string
    resolutionType: 'discussion' | 'expert_input' | 'additional_data'
    urgencyLevel: 'emergency' | 'urgent' | 'standard'

WebSocket /conflicts/resolution/{sessionId}:
  events:
    - session_started
    - consensus_improving
    - resolution_achieved
```

---

### **4. TeamPresenceIndicator API Requirements**

**Required API Implementation**:
```yaml
GET /teams/{teamId}/presence/current:
  description: Get real-time team presence for healthcare decisions
  response:
    teamMembers:
      - id: string
        role: HealthcareRole
        isOnline: boolean
        currentDevice: 'mobile' | 'tablet' | 'desktop'
        evaluationProgress: number
    quorumStatus:
      required: HealthcareRole[]
      present: HealthcareRole[]
      quorumMet: boolean

WebSocket /teams/{teamId}/presence/live:
  events:
    - member_joined
    - member_left
    - quorum_status_changed

POST /teams/{teamId}/emergency-override:
  description: Override quorum requirements for emergency decisions
  requestBody:
    decisionId: string
    overrideReason: string
    emergencyJustification: string
```

---

### **5. AlternativeComparisonCard API Requirements**

**Required API Enhancement**:
```yaml
GET /alternatives/{decisionId}/healthcare-analysis:
  description: Get healthcare-optimized alternative comparison
  response:
    alternatives:
      - id: string
        name: string
        healthcareAssessment:
          patientSafetyScore: number
          clinicalEvidenceLevel: string
          implementationComplexity: number
        riskAnalysis:
          clinicalRisk: 'low' | 'medium' | 'high'
          mitigationStrategies: string[]
        evaluationSummary:
          averageScore: number
          consensusLevel: number
    comparisonMatrix:
      criteria: ComparisonCriterion[]
      weightedRankings: Alternative[]

PUT /alternatives/{decisionId}/comparison-criteria:
  description: Update comparison criteria for healthcare context
  requestBody:
    criteria:
      - name: string
        category: 'clinical' | 'operational' | 'financial'
        weight: number
        healthcareImportance: 'critical' | 'important' | 'helpful'
```

---

### **6. DecisionAuditTrail API Requirements**

**Required HIPAA-Compliant Implementation**:
```yaml
GET /decisions/{id}/audit-trail:
  description: Get HIPAA-compliant audit trail
  parameters:
    complianceLevel: 'hipaa' | 'joint_commission' | 'cms'
    includeAnonymousEvents: boolean
  response:
    events:
      - id: string
        timestamp: Date
        eventType: AuditEventType
        actorRole: HealthcareRole
        action: string
        complianceFlags: string[]
    complianceSummary:
      regulatoryRequirements: string[]
      auditReadiness: boolean

POST /audit/compliance-report:
  description: Generate regulatory compliance report
  requestBody:
    decisionIds: string[]
    reportType: 'joint_commission' | 'cms' | 'internal_audit'
    dateRange: [Date, Date]
  response:
    reportUrl: string
    complianceScore: number
    recommendations: string[]

GET /audit/export/{decisionId}:
  description: Export audit trail in multiple formats
  parameters:
    format: 'pdf' | 'json' | 'csv'
    complianceLevel: string
  response:
    downloadUrl: string
    expiresAt: Date
```

---

## 📊 **API REDESIGN IMPACT ANALYSIS**

### **High Priority API Changes** (Critical for MVP):
1. **Anonymous evaluation system** - Complete redesign required
2. **Real-time conflict detection** - New WebSocket infrastructure  
3. **Healthcare role-based presence** - New team management system
4. **Phase validation with healthcare compliance** - Enhanced workflow control

### **Medium Priority API Changes** (Post-MVP):
1. **Advanced audit trail with compliance reporting** - Enhanced HIPAA features
2. **Dynamic alternative assessment** - Healthcare-specific evaluation
3. **Emergency decision override protocols** - Safety-critical workflows

### **Existing API Deprecation Plan**:
```yaml
# APIs to be replaced/enhanced
DEPRECATED:
  - Basic evaluation endpoints → Anonymous evaluation system
  - Simple conflict detection → Advanced healthcare conflict analysis  
  - Generic team management → Healthcare role-based presence
  - Basic audit logging → HIPAA-compliant audit trail

ENHANCED:
  - Decision phase management → Healthcare workflow validation
  - Alternative comparison → Healthcare-specific assessment
  - Real-time updates → Healthcare team collaboration features
```

---

## 🔧 **IMPLEMENTATION STRATEGY**

### **Phase 1: Core API Redesign (Week 2-3)**
- Anonymous evaluation endpoints with session management
- Real-time conflict detection WebSocket infrastructure
- Healthcare role-based team presence tracking
- Enhanced decision phase validation

### **Phase 2: Healthcare Optimization (Week 3-4)**  
- HIPAA-compliant audit trail with compliance reporting
- Healthcare-specific alternative assessment endpoints
- Emergency decision override protocols
- Advanced conflict resolution workflow management

### **Phase 3: Integration & Testing (Week 4-5)**
- OpenAPI specification update with new endpoints
- Frontend component integration with redesigned APIs
- Performance testing with healthcare-specific load patterns
- HIPAA compliance validation and security audit

---

## 📋 **OPENAPI SPECIFICATION UPDATE REQUIREMENTS**

### **New Endpoint Categories**:
```yaml
# Anonymous Evaluation System
/sessions/anonymous/** - Session management for anonymous input
/evaluations/anonymous/** - Anonymous evaluation submission and aggregation

# Advanced Conflict Management  
/conflicts/detailed/** - Healthcare-specific conflict analysis
/conflicts/resolution/** - Structured conflict resolution workflows

# Healthcare Team Management
/teams/{id}/presence/** - Real-time presence with healthcare roles
/teams/{id}/emergency/** - Emergency decision override protocols

# HIPAA Audit & Compliance
/audit/compliance/** - Regulatory compliance reporting
/audit/export/** - Multi-format audit trail exports
```

### **WebSocket Event Categories**:
```yaml
# Real-time Collaboration
/decisions/{id}/phase-updates - Phase progression and validation
/evaluations/conflicts/{id} - Conflict detection and resolution
/teams/{id}/presence/live - Team member presence and participation

# Healthcare Emergency Protocols
/emergency/decisions/{id} - Emergency decision coordination
/emergency/notifications/{teamId} - Critical team notifications
```

---

## 🎯 **SUCCESS METRICS FOR API REDESIGN**

### **Technical Performance**:
- **Response Time**: <200ms for all evaluation endpoints
- **WebSocket Latency**: <100ms for real-time updates
- **Conflict Detection**: <500ms from evaluation to conflict alert
- **Anonymous Session**: Zero linkage to user identity in audit logs

### **Healthcare Compliance**:
- **HIPAA Audit Trail**: 100% event coverage with anonymity preservation
- **Role-based Access**: Proper healthcare role validation and authorization
- **Emergency Protocols**: <30 second override capability for patient safety
- **Regulatory Reporting**: Automated compliance report generation

### **User Experience Impact**:
- **Anonymous Evaluation Trust**: 95%+ user confidence in anonymity
- **Conflict Resolution Speed**: 50% reduction in conflict resolution time
- **Team Collaboration**: Real-time updates with <200ms latency
- **Decision Quality**: Improved consensus through better UX

---

## 📋 **CLAUDE CODE HANDOFF CHECKLIST**

### **API Integration Priority**:
1. **Anonymous evaluation endpoints** - Core differentiator implementation
2. **Real-time conflict detection** - WebSocket integration for team safety
3. **Healthcare presence management** - Role-based collaboration features
4. **Enhanced decision workflows** - Phase validation with compliance

### **Implementation Guidelines**:
- Use TypeScript interfaces from component library specifications
- Implement error handling for offline scenarios (healthcare environments)
- Build retry logic with exponential backoff for critical operations
- Cache anonymous session tokens securely with automatic expiration

---

**STATUS**: API integration mapping complete - UX-optimized endpoint specifications ready  
**HANDOFF READY**: Claude Code can now implement components with optimal API integration  
**GOAL**: Superior healthcare team decision experience through UX-first API design

