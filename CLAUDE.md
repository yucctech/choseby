# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

# 🚀 CHOSEBY HEALTHCARE DECISION PLATFORM - FRONTEND IMPLEMENTATION READY

## PROJECT STATUS: TECHNICAL FOUNDATION COMPLETE → FRONTEND IMPLEMENTATION PHASE ✅
**Product**: Healthcare Decision Platform for 5-8 person medical leadership teams
**Validation**: 15/15 interviews successful, $300-800/month healthcare budgets confirmed
**Backend**: 100% complete with live deployment at https://choseby.onrender.com
**Target**: Frontend implementation to achieve $500+ MRR from 5 healthcare teams by Week 8

---

## 🚨 CRITICAL: READ THESE FILES IN EXACT ORDER BEFORE ANY WORK

Every new Claude Code session MUST read these files in this exact sequence:

1. **`docs/SESSION_CONTEXT.md`** - ESSENTIAL AI behavior rules and project guidelines
2. **`docs/technical/implementation/README.md`** - **"CLAUDE CODE START HERE"** - Implementation entry point
3. **`docs/technical/implementation/screen-implementations.md`** - Component-to-screen mapping for all 26 wireframes
4. **`docs/technical/wireframes/MVP_IMPLEMENTATION_GUIDE.md`** - Single source of truth for Week 8 scope
5. **`docs/technical/wireframes/core-decide-workflow-wireframes.md`** - Revenue-critical screens 1-8

---

## 🌐 **LIVE BACKEND INFRASTRUCTURE** ✅

### **Deployment URLs (Production Ready)**:
- **Frontend**: https://choseby.vercel.app (Next.js app ready for wireframe implementation)
- **Backend API**: https://choseby.onrender.com (Go/Gin server with 40+ healthcare endpoints)
- **Health Check**: https://choseby.onrender.com/api/v1/health
- **Database**: Supabase PostgreSQL with HIPAA-compliant healthcare schemas

### **Backend Status (100% Complete)**:
- ✅ **40+ RESTful API Endpoints**: Team management, decision workflows, anonymous evaluation
- ✅ **Authentication System**: JWT + healthcare SSO integration ready
- ✅ **Anonymous Evaluation**: Session-based anonymity with 2.5 variance conflict detection
- ✅ **Real-time Features**: WebSocket support for team collaboration
- ✅ **HIPAA Compliance**: Audit trails, data encryption, role-based access
- ✅ **Database Schemas**: Complete PostgreSQL with healthcare team structures

---

## 🎨 **FRONTEND IMPLEMENTATION SPECIFICATIONS** ✅

### **Expert Validation Complete (8.2/10)**:
- ✅ **All 26 Wireframes**: Mobile-first design with responsive variants
- ✅ **Healthcare Optimization**: Emergency decisions, clinical rounds, boardroom presentations
- ✅ **Component Specifications**: Ready for React/Next.js implementation
- ✅ **API Integration Mapped**: UX-optimized endpoint connections documented

### **Core Implementation Files**:
1. **`docs/technical/implementation/screen-implementations.md`** - All 26 screens with component details
2. **`docs/technical/implementation/api-integration-mapping.md`** - Backend endpoint connections
3. **`docs/technical/implementation/responsive-design-system.md`** - Mobile/tablet/desktop variants
4. **`docs/technical/api/implementation-guide.md`** - Complete API documentation with TypeScript interfaces

### **Revenue-Critical Features (UNIQUE DIFFERENTIATORS)**:
1. **Anonymous Evaluation System** - Eliminates medical hierarchy pressure
2. **Conflict Detection Algorithm** - 2.5 variance threshold triggers team discussion
3. **Professional Documentation** - Board-ready reports justify $107-172/month pricing
4. **6-Phase DECIDE Methodology** - Structured healthcare team decision workflow

---

## 📱 **RESPONSIVE DESIGN REQUIREMENTS**

### **Healthcare Device Context**:
- **Mobile (320-414px)**: Emergency decisions, individual input - <1s load time priority
- **Tablet (768-1024px)**: Clinical rounds, bedside discussions - touch-optimized
- **Desktop (1200px+)**: Boardroom presentations, leadership meetings - full analytics

### **Performance Requirements**:
- **Response Time**: <2 seconds for all decision workflow interactions
- **Mobile Optimization**: <1 second load time for emergency decision screens
- **Conflict Detection**: <3 seconds for team evaluation analysis
- **Platform Uptime**: 99.9% availability for pilot healthcare teams

---

## 🎯 **IMPLEMENTATION PRIORITY ORDER**

### **Phase 1: Core DECIDE Workflow (Screens 1-8)** ⭐ **REVENUE CRITICAL**
**Timeline**: Week 2-3 Implementation
**Revenue Impact**: These 8 screens directly support $107-172/month pricing model

1. **Screen 1: Dashboard** - Active decisions, emergency access, team status overview
2. **Screen 2: Create Decision** - Emergency/Express/Full DECIDE workflow selection
3. **Screen 3: Define Problem** - Healthcare context, stakeholder identification
4. **Screen 4: Establish Criteria** - Patient safety, cost, timeline criteria
5. **Screen 5: Consider Options** - Alternative comparison with healthcare impact assessment
6. **Screen 6: Anonymous Evaluation** ⭐ **CORE DIFFERENTIATOR** - Conflict detection UI
7. **Screen 7: Action Planning** - Implementation timeline, responsibility assignment
8. **Screen 8: Monitor Results** - Success metrics, outcome tracking

### **Phase 2: Team Collaboration (Screens 9-14)**
**Timeline**: Week 3-4 Implementation
**Focus**: Real-time features for team coordination

9. **Screen 9: Team Management** - Multi-user functionality required for team billing
10-14. **Collaboration Features**: Real-time presence, progress tracking, analytics dashboard

### **Phase 3: Healthcare Compliance (Screens 15-26)**
**Timeline**: Week 4-6 Implementation
**Focus**: Professional documentation and compliance workflows

15. **Screen 15: Professional Documentation** - Board reports that justify premium pricing
24-26. **Conflict Resolution Screens** - Advanced workflow for handling team disagreements

---

## 💻 **TECHNOLOGY STACK & SETUP**

### **Frontend Stack**:
- **Framework**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS with healthcare-optimized responsive breakpoints
- **State Management**: [Current: Context/useState - specify if different]
- **API Client**: [Current: Fetch API - specify if using Axios/SWR/React Query]
- **Real-time**: WebSocket client for team collaboration features
- **Deployment**: Vercel with automatic deployment from main branch

### **Development Environment**:
- **Repository**: GitHub monorepo structure with frontend/backend separation
- **API Base URL**: https://choseby.onrender.com/api/v1
- **Database Connection**: Supabase PostgreSQL (connection strings in environment)
- **Authentication**: JWT tokens from backend API integration

---

## 🏥 **HEALTHCARE-SPECIFIC IMPLEMENTATION**

### **Anonymous Evaluation System (Core Feature)**:
```typescript
// Example: Anonymous evaluation component interface
interface AnonymousEvaluationProps {
  decisionId: string;
  criteria: DecisionCriteria[];
  alternatives: Alternative[];
  onSubmit: (evaluations: AnonymousEvaluation[]) => void;
  conflictThreshold: number; // 2.5 variance threshold
}
```

### **Conflict Detection UI (Revenue Critical)**:
```typescript
// Example: Conflict detection display
interface ConflictAlertProps {
  conflictLevel: 'low' | 'medium' | 'high';
  affectedCriteria: string[];
  varianceScore: number;
  onResolveClick: () => void;
}
```

### **Healthcare Role Management**:
- **Clinical Roles**: Physician, Nurse, Pharmacist, Technician
- **Administrative**: Medical Director, Department Head, Administrator
- **Permissions**: Hierarchical access with anonymous evaluation privacy protection

---

## 📊 **SUCCESS CRITERIA & BUSINESS CONTEXT**

### **Week 8 Revenue Target**:
- **5 Healthcare Teams**: Using platform for real medical decisions
- **$500+ MRR**: From validated $107-172/month pricing per team
- **>80% Conflict Resolution**: Through anonymous evaluation and structured discussion
- **90%+ Satisfaction**: Based on validation interview patterns

### **Customer Validation Context**:
- **Healthcare Budgets**: $300-800/month (150-400% above our pricing)
- **Pain Points**: Medical hierarchy, hidden conflicts, $20K-70K decision waste
- **Value Proposition**: Anonymous input + conflict detection + professional documentation
- **ROI Validated**: 10-50:1 return on investment across healthcare teams

---

## 🚫 **CRITICAL AI BEHAVIOR RULES**

### **NEVER CREATE THESE FILES**:
- summary.md, recap.md, session-summary.md
- test-results.md, analysis.md, findings.md
- todo.md, next-steps.md, action-items.md
- Duplicate files with version numbers (file-v2.md, file-final.md)

### **REQUIRED BEHAVIORS**:
- **UPDATE-ONLY POLICY**: Modify existing files freely, never create duplicates
- **ASK PERMISSION**: ONLY before creating NEW files (updates require NO permission)
- **MVP FOCUS**: Build Week 8 revenue-critical features first (Screens 1-8)
- **Healthcare Context**: Prioritize emergency decision workflows and mobile optimization

---

## 🔧 **API INTEGRATION READY**

### **Key Backend Endpoints Available**:
```typescript
// Team Management
GET    /api/v1/teams/{teamId}/members
POST   /api/v1/teams/{teamId}/decisions
GET    /api/v1/decisions/{decisionId}/status

// Anonymous Evaluation System (Core Feature)
POST   /api/v1/decisions/{decisionId}/evaluations
GET    /api/v1/decisions/{decisionId}/conflicts
POST   /api/v1/decisions/{decisionId}/resolve

// Real-time Collaboration
WebSocket: /api/v1/teams/{teamId}/presence
WebSocket: /api/v1/decisions/{decisionId}/progress

// Professional Documentation (Revenue Justification)
POST   /api/v1/decisions/{decisionId}/reports
GET    /api/v1/teams/{teamId}/analytics
```

### **Authentication Integration**:
```typescript
// JWT Token management with healthcare SSO ready
const authHeaders = {
  'Authorization': `Bearer ${jwtToken}`,
  'Content-Type': 'application/json'
};
```

---

## 🎯 **IMMEDIATE DEVELOPMENT STEPS**

### **Step 1: Environment & Wireframe Review**
1. **Examine current codebase** at https://choseby.vercel.app
2. **Study implementation guide** at `docs/technical/implementation/README.md`
3. **Review Screen 1-8 wireframes** in `core-decide-workflow-wireframes.md`
4. **Test API connectivity** to https://choseby.onrender.com/api/v1/health

### **Step 2: Revenue-Critical Implementation**
1. **Screen 1: Dashboard** - Healthcare team decision overview with active decision cards
2. **Screen 6: Anonymous Evaluation** - Core differentiator with conflict detection alerts
3. **Screen 15: Professional Documentation** - Board-ready reports justifying premium pricing
4. **Mobile responsiveness** for emergency healthcare decision contexts

### **Step 3: Team Collaboration Features**
1. **Real-time presence tracking** using WebSocket connections
2. **Conflict resolution workflow** for handling team disagreements
3. **Progress monitoring** for multi-phase decision processes
4. **Analytics dashboard** for team performance insights

---

## 📁 **COMPLETE DOCUMENTATION AVAILABLE**

### **Implementation Resources**:
- **`docs/technical/implementation/`** - All Claude Code implementation specifications
- **`docs/technical/wireframes/`** - Expert-validated designs for all 26 screens
- **`docs/technical/api/`** - Complete backend API documentation and schemas
- **`docs/technical/wireframes/MVP_IMPLEMENTATION_GUIDE.md`** - Week 8 scope protection

### **Business Context Files**:
- **`docs/business/customer-interviews/`** - Healthcare team validation results
- **`docs/business/customer-success/`** - Pilot customer onboarding processes
- **`docs/current/SPRINT_STATUS.md`** - Current development phase status

---

## 🚀 **CIPHER CHECK: Start with "CHOSEBY-FRONTEND-READY" if you understand the implementation requirements**

**Your mission**: Implement expert-validated wireframes using the live backend API to create a healthcare decision platform that achieves $500+ MRR by Week 8 through 5 pilot team deployments.

**Priority**: Start with Core DECIDE Workflow (Screens 1-8) as these directly impact revenue generation and customer retention in the healthcare market.

**Context**: Backend is complete and live, wireframes are expert-validated, customer demand is proven - now build the user interface that converts healthcare teams into paying customers.