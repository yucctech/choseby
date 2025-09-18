# Team Decision Platform - UI/UX Design System

**Date**: September 16, 2025 (Updated)
**Status**: Realigned with Current Business Strategy
**Approach**: Team collaboration platform with professional workflow design

## Design Philosophy
**Core Principle**: "Facilitate team decisions through structured collaboration and conflict resolution"

### User Experience Strategy
- **Team-First Design**: Multi-user collaboration as primary workflow
- **Anonymous Input**: Private scoring to eliminate political pressure
- **Conflict Visualization**: Clear identification of team disagreements
- **Professional Output**: Board-ready decision documentation
- **Role-Based Access**: Different views for team admins, members, and observers

## Core UI Patterns

### Visual Design Language
- **Interface Style**: Card-based layout with clean typography
- **Color Strategy**: Professional healthcare/business colors with trust indicators
- **Animation Approach**: Subtle transitions, team progress indicators
- **Spacing System**: Consistent 8px grid system
- **Accessibility**: WCAG 2.1 AA compliance for healthcare environments

### Component Architecture
- **Team Setup**: Create team, invite members, assign roles (admin/member/observer)
- **Decision Creation**: Simple form with title, description, and evaluation criteria
- **Anonymous Scoring**: Private scoring interface with conflict detection
- **Team Progress**: Real-time collaboration status and completion tracking
- **Results Dashboard**: Professional decision documentation and export

## Team Collaboration Features

### Core Team Functions
- **Team Management**: Create teams, invite members via email, role assignments
- **Decision Workflow**: Simple decision creation with custom evaluation criteria
- **Anonymous Scoring**: Private 1-10 scoring system with optional rationale
- **Conflict Detection**: Automatic identification of score variance and disagreements
- **Progress Tracking**: Real-time team participation and completion status

### Professional Documentation
1. **Decision Setup**: Team-defined criteria with custom weighting
2. **Anonymous Input**: Private scoring to eliminate hierarchy bias
3. **Conflict Resolution**: Facilitate discussion around identified disagreements
4. **Professional Output**: Board-ready documentation with team consensus
5. **Audit Trail**: Complete decision history for compliance requirements

## Technical Implementation Notes
- **Frontend**: Next.js 14 with card-based responsive design
- **Authentication**: Supabase Auth with team-based Row Level Security
- **Database**: PostgreSQL with multi-tenant team isolation
- **State Management**: React Context for team collaboration features
- **Styling**: Tailwind CSS with Shadcn/ui component library
- **Real-time**: Supabase real-time subscriptions for team collaboration

## Core User Flows

### 1. Team Setup Flow
- Admin creates team → Invites members via email → Assigns roles → Team dashboard

### 2. Decision Creation Flow  
- Team member creates decision → Defines evaluation criteria → Invites team scoring → Monitors progress

### 3. Anonymous Scoring Flow
- Team members receive notification → Private scoring interface → Submit scores with rationale → View aggregated results

### 4. Conflict Resolution Flow
- System detects disagreements → Highlights conflicting areas → Facilitates team discussion → Documents final consensus

### 5. Professional Documentation Flow
- Generate board-ready report → Export options (PDF, Word) → Archive completed decisions → Audit trail access

## Required Design Tasks (Phase 0 - Before Development)

**⚠️ CRITICAL UPDATE**: Based on 6-phase DECIDE methodology implementation
**Reference**: See `docs/technical/COMPLETE_TECHNICAL_SPECIFICATIONS.md` for complete feature requirements

### Priority 1: Complete Wireframe Set (23 Screens Required)

#### DECIDE Methodology Workflow Screens (8 screens)
1. **Dashboard/Home Screen**: Overview of all team decisions, phase status, team performance
2. **Decision Creation**: Initial setup, problem description, team assignment
3. **Phase 1 - Define Problem**: Problem statement, stakeholder identification, success criteria
4. **Phase 2 - Establish Criteria**: Criteria definition with AI assistance, weight assignment (3-8 criteria)
5. **Phase 3 - Consider Options**: Options definition interface (2-6 options with feasibility review)
6. **Phase 4 - Anonymous Evaluation**: Private scoring interface, conflict detection alerts
7. **Phase 5 - Develop Action Plan**: Implementation planning, timeline, responsibility assignment
8. **Phase 6 - Evaluate and Monitor**: Success metrics definition, review scheduling

#### Team Management & Collaboration Screens (6 screens)
9. **Team Setup/Management**: Create team, manage members, role assignments (admin/facilitator/member/clinical_lead)
10. **Team Member Invitation**: Email invitation workflow with healthcare role specification
11. **Real-time Progress View**: Team participation status, completion tracking, notification center
12. **Conflict Detection & Resolution**: Disagreement visualization, resolution workflow tools
13. **Results & Analytics Dashboard**: Aggregated scores, team performance, decision outcomes
14. **User Profile/Settings**: Individual preferences, healthcare role, notification settings

#### Healthcare Compliance & Documentation Screens (4 screens)
15. **Professional Documentation Generator**: Board-ready PDF reports with audit trails
16. **Healthcare Compliance Dashboard**: Patient impact tracking, HIPAA compliance status
17. **Audit Trail View**: Complete decision history, user actions, compliance logs
18. **Healthcare Templates**: Pre-built criteria sets for vendor selection, hiring, compliance decisions

#### AI Integration Screens (3 screens)
19. **AI Framework Suggestion**: DeepSeek R1 framework recommendations with confidence scores
20. **AI Criteria Generation**: Healthcare-specific criteria suggestions with compliance considerations
21. **AI Conflict Analysis**: Advanced disagreement pattern analysis, resolution suggestions

#### Authentication & Onboarding Screens (2 screens)
22. **Login/Authentication**: Supabase Auth with healthcare organization email verification
23. **Team Onboarding Flow**: New team creation wizard, member setup, training materials

### Priority 2: Component Library (Updated for Healthcare Workflow)
1. **DECIDE Phase Components**: Phase progress indicators, transition controls, validation messages
2. **Anonymous Evaluation Components**: Scoring matrices, confidence sliders, rationale inputs
3. **Conflict Detection Components**: Variance visualizations, disagreement alerts, resolution tools
4. **Healthcare Compliance Components**: Patient impact indicators, regulatory requirement flags
5. **Team Collaboration Components**: Member status cards, participation tracking, notification badges
6. **AI Integration Components**: Framework suggestion cards, criteria generation interface, confidence indicators

### Priority 3: Mobile Responsive Design (Healthcare Environment Optimized)
1. **Mobile DECIDE Workflow**: Touch-optimized phase navigation, mobile scoring interface
2. **Healthcare Team Mobile Experience**: Quick access for clinical staff, tablet-optimized layouts
3. **Offline Capability Considerations**: Decision data caching for areas with poor connectivity

**Updated Date**: September 18, 2025
**Implementation Priority**: CRITICAL - User flows completed ✅, API docs + wireframes required next
**User Flow Status**: ✅ COMPLETED - 6-phase DECIDE + Emergency + Express modes validated
**Target Customer**: Healthcare teams (5-8 person leadership teams)
**AI Strategy**: DeepSeek R1 local model + API fallbacks ($10/month budget maximum)
**Compliance Requirements**: HIPAA-compliant design patterns, audit trail integration

**Status**: USER FLOWS COMPLETE - Ready for API documentation then wireframe development
**Next Actions**: 
1. Create API documentation based on validated user flows
2. Create detailed wireframes for all 23 screens
3. Validate wireframes with healthcare teams before development starts

**CRITICAL**: All user flows validated by UX/PM/Healthcare/Technical experts - see `docs/technical/user-flows/expert-revalidation-improved-workflow.md`