# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

# 🚨 CHOSEBY TEAM DECISION PLATFORM - DEVELOPMENT EXECUTION

## PROJECT STATUS: VALIDATION COMPLETE → DEVELOPMENT APPROVED ✅
**Product**: Team Decision Platform for 5-8 person leadership teams
**Validation**: 15/15 interviews successful across 4 industry segments
**Budget**: $50K development budget approved with 100% confidence
**Timeline**: 8-week MVP targeting $500+ MRR with healthcare teams

## CRITICAL: READ THESE FILES IN EXACT ORDER BEFORE ANY WORK

Every new Claude Code session MUST read these files in this exact sequence:

1. **`docs/SESSION_CONTEXT.md`** - ESSENTIAL AI behavior rules and project status
2. **`docs/technical/README.md`** - Complete technical documentation index
3. **`docs/technical/api/implementation-guide.md`** - Database schemas, authentication, deployment specs
4. **`docs/technical/api/openapi-specification.yaml`** - Complete API specification (40+ endpoints)
5. **`docs/current/SPRINT_STATUS.md`** - Current development priorities

## DEVELOPMENT STATUS: COMPLETE TECHNICAL FOUNDATION READY ✅

### ✅ API DOCUMENTATION & EXPERT VALIDATION COMPLETE
- **Complete OpenAPI 3.0.3 Specification**: 40+ RESTful endpoints for healthcare workflows
- **Database Schemas**: PostgreSQL design with HIPAA compliance and conflict detection algorithms
- **Implementation Guide**: Complete development specifications with code examples and deployment patterns
- **Expert Validation Results**: Technical Lead, UX Designer, Healthcare Expert, Product Manager, Security Expert approved

### ✅ WIREFRAME SPECIFICATIONS & FRONTEND READY
- **Complete Wireframes**: 26 mobile-first screens including conflict resolution workflow
- **System Trust Components**: Connection status indicators, auto-save feedback, anonymous mode protection
- **Expert Validation**: 9.2/10 score from UI/UX, CTO, CEO, Healthcare Expert, Product Manager perspectives
- **Component Specifications**: Detailed React component definitions with state management and API integration

### 🚀 DEVELOPMENT-READY DOCUMENTATION LOCATIONS:
- **Backend API**: `docs/technical/api/openapi-specification.yaml` + `docs/technical/api/implementation-guide.md`
- **Frontend Wireframes**: `docs/technical/wireframes/full-decide-methodology-screens.md`
- **Validation Reports**: `docs/technical/api/expert-validation-api-documentation.md` + `docs/technical/wireframes/expert-validation-wireframes.md`

### 🎯 IMMEDIATE DEVELOPMENT PRIORITIES (Week 1-2)
1. **Go Backend API Implementation**: Complete Go API server using provided OpenAPI specification
2. **Database Setup**: PostgreSQL with provided healthcare-compliant schemas and performance optimization
3. **Authentication System**: JWT + healthcare SSO integration patterns (Epic, Cerner, Allscripts)
4. **Anonymous Evaluation System**: Core conflict detection algorithm with 2.5 variance threshold
5. **Frontend Implementation**: 26 mobile-first React screens with conflict resolution workflow
6. **Real-time Collaboration**: WebSocket integration for team brainstorming and updates
7. **HIPAA Compliance**: Complete audit trails, data encryption, role-based access control

### CUSTOMER CONTEXT: Healthcare Teams Priority
Healthcare teams need anonymous input collection to eliminate politics, conflict detection to show disagreements, professional documentation for compliance.

### TECHNICAL REQUIREMENTS FROM VALIDATION:
- **Multi-tenant team isolation** (Row Level Security)
- **Anonymous scoring system** (private evaluations)
- **Conflict detection algorithm** (identify disagreements)
- **Professional export** (board-ready documentation)

## CRITICAL AI BEHAVIOR RULES (ENFORCE IMMEDIATELY)

### 🚫 NEVER CREATE THESE FILES:
- summary.md, recap.md, session-summary.md
- test-results.md, analysis.md, findings.md
- todo.md, next-steps.md, action-items.md
- Duplicate files with version numbers (file-v2.md, file-final.md)

### ✅ REQUIRED BEHAVIORS:
- **UPDATE-ONLY POLICY**: Modify existing files freely, never create duplicates
- **ASK PERMISSION**: ONLY before creating NEW files (updates require NO permission)
- **CUSTOMER-FIRST**: Build features that enable pilot customer usage immediately

## SUCCESS CRITERIA ✅

### Week 1-2 Demo Requirements (IMMEDIATE)
- **Working development environment** - Complete Go backend API server with PostgreSQL database
- **Database schema implemented** - All tables from implementation guide with proper indexes and RLS
- **Authentication system working** - JWT + healthcare SSO integration functional
- **Anonymous evaluation system** - Core conflict detection algorithm (2.5 variance threshold) implemented
- **Core API endpoints functional** - Team management, decision workflows, evaluation collection

### Week 3-4 Checkpoint (FRONTEND + INTEGRATION)
- **Frontend implementation complete** - All 26 screens from wireframe specifications functional
- **Real-time collaboration working** - WebSocket integration for team brainstorming and updates
- **Conflict resolution workflow** - Complete 3-screen conflict resolution process operational
- **HIPAA audit trails** - Complete decision tracking and compliance reporting functional
- **Pilot customer demo ready** - Platform ready for healthcare team onboarding

### Week 8 MVP Goal
- ✅ 5 paying healthcare teams at $129-172/month
- ✅ $500+ MRR with customer retention
- ✅ Technical foundation scaling to 100+ teams

## TECHNOLOGY STACK (Updated for Zero-Cost Deployment) ✅

```go
// Backend Stack - GO IMPLEMENTATION
API Framework: Go with Gin/Echo framework
Database: PostgreSQL with healthcare data structures and real-time features
Authentication: JWT with healthcare SSO integration (Epic, Cerner, Allscripts)
Real-time: WebSocket support for team collaboration
Team Features: Anonymous evaluation, conflict detection, professional documentation
Deployment: Railway/Fly.io free tier, single binary deployment

// Frontend Stack
Framework: React/Next.js (Static export for zero-cost hosting)
Styling: Tailwind CSS for mobile-first healthcare workflows
API Integration: RESTful API calls to Go backend
Real-time Features: WebSocket client for team collaboration
Deployment: Netlify/Vercel free tier for static frontend

// Infrastructure - ZERO COST FOCUS
Development: Local PostgreSQL + Go development server
Production Backend: Railway/Fly.io free tier (Go single binary)
Production Frontend: Netlify/Vercel free tier (static Next.js export)
Database: Railway PostgreSQL free tier / Supabase free tier
Team Platform: Multi-user capabilities with anonymous evaluation
Healthcare Compliance: HIPAA-ready data structures and audit trails
```

## HEALTHCARE-SPECIFIC REQUIREMENTS ✅

### HIPAA Compliance (CRITICAL)
- **Data Encryption**: End-to-end encryption for all healthcare data
- **Audit Trails**: Complete decision history with user attribution  
- **Anonymous Evaluation**: Individual scores isolated from user identity
- **Role-Based Access**: Clinical vs administrative permissions
- **SSO Integration**: Epic, Cerner, Allscripts authentication patterns

### Core Algorithm: Conflict Detection
```sql
-- Variance threshold >2.5 identifies team disagreements
SELECT 
  option_id, criterion_id,
  STDDEV(score) as variance,
  CASE 
    WHEN STDDEV(score) > 2.5 THEN 'high'
    WHEN STDDEV(score) > 1.5 THEN 'medium'  
    ELSE 'low'
  END as conflict_level
FROM evaluation_scores
GROUP BY option_id, criterion_id
HAVING COUNT(*) >= 2;
```

## BUSINESS CONTEXT ✅

### Revenue Model Transformation Validated
**Individual Platform**: $21.50/user/month → **Team Platform**: $107.50-172/month = **250-400% revenue increase per customer**

### Customer Budget Validation - EXCEPTIONAL SUCCESS
- **Professional Services**: $150-400/month budgets (vs our $107.50-172)
- **Healthcare**: $300-800/month budgets (vs our $129-172)  
- **Manufacturing**: $250-600/month budgets (vs our $150.50-172)
- **Tech Scale-ups**: $400-600/month budgets (vs our $129-172)

### Universal Team Decision Challenges (15/15 Interviews)
1. **Professional Silos**: Coordination challenges between expertise areas across all industries
2. **Hidden Conflict Dynamics**: Team members avoid public disagreement universally
3. **Massive Coordination Costs**: $20K-70K per decision consistently across all segments
4. **Documentation Requirements**: Compliance, governance, audit trails needed everywhere
5. **ROI Recognition**: 10-50:1 return on investment validated across all customer segments

## CRITICAL PATH: COMPLETE PLATFORM IMPLEMENTATION USING EXPERT-VALIDATED SPECIFICATIONS

**DEVELOPMENT READY**: Complete technical foundation with expert validation available in `docs/technical/`

### Phase 1: Backend Implementation (Week 1-2) 
- **API Server**: Node.js/Express using complete OpenAPI specification (40+ endpoints)
- **Database**: PostgreSQL with all schemas from implementation guide
- **Authentication**: JWT + healthcare SSO integration patterns
- **Anonymous Evaluation**: Conflict detection algorithms and evaluation isolation
- **Real-time Features**: WebSocket server for team collaboration

### Phase 2: Frontend Implementation (Week 2-3)
- **React Components**: 26 mobile-first screens from wireframe specifications  
- **State Management**: Integration with backend API endpoints
- **System Trust Features**: Connection status, auto-save, anonymous mode indicators
- **Conflict Resolution**: 3-screen workflow for team disagreement resolution
- **Healthcare UX**: SSO integration, HIPAA-compliant interfaces

### Phase 3: Integration & Polish (Week 3-4)
- **End-to-end Workflows**: Complete DECIDE methodology with healthcare customization
- **Performance Optimization**: <2 second response times, caching strategies
- **HIPAA Compliance**: Complete audit trails, data encryption, role-based access
- **Pilot Customer Readiness**: Platform ready for healthcare team onboarding

**Reference Documentation**:
- **Backend API**: `docs/technical/api/openapi-specification.yaml` + `docs/technical/api/implementation-guide.md`
- **Frontend Wireframes**: `docs/technical/wireframes/full-decide-methodology-screens.md`
- **Expert Validation**: All documentation expert-approved with 9.0+ scores across perspectives

## 🚀 CIPHER CHECK: Start with "CHOSEBY-CODE-READY" if you've read the technical documentation
