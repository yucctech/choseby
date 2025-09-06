# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

# 🚨 KRYVER TEAM DECISION PLATFORM - DEVELOPMENT EXECUTION

## PROJECT STATUS: VALIDATION COMPLETE → DEVELOPMENT APPROVED ✅
**Product**: Team Decision Platform for 5-8 person leadership teams
**Validation**: 15/15 interviews successful across 4 industry segments
**Budget**: $50K development budget approved with 100% confidence
**Timeline**: 8-week MVP targeting $500+ MRR with healthcare teams

## CRITICAL: READ THESE FILES IN EXACT ORDER BEFORE ANY WORK

Every new Claude Code session MUST read these files in this exact sequence:

1. **`docs/SESSION_CONTEXT.md`** - ESSENTIAL AI behavior rules and project status
2. **`docs/TECHNICAL_ARCHITECTURE_PLAN.md`** - Complete technical specifications and startup prompt
3. **`docs/operations/WEEK_1_TASK_ASSIGNMENTS.md`** - Immediate development priorities
4. **`docs/README.md`** - Team decision platform strategy overview
5. **`docs/essential-business-data.md`** - Complete validation results and business model

## DEVELOPMENT MISSION ✅

### IMMEDIATE TASK: Week 1 Foundation Setup
1. **Set up Next.js 14 project** with TypeScript + Tailwind CSS
2. **Configure Supabase database** with team decision schema
3. **Implement NextAuth.js** for team-based authentication  
4. **Create basic team management** (create team, invite members, roles)

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

### Week 1 Demo Requirements
- **Working development environment** - All team members can run project locally
- **Database schema implemented** - Teams, users, decisions, scores tables with RLS
- **Authentication system** - NextAuth.js working with team-based sessions  
- **Basic team management** - Create team, invite members, assign roles functioning

### Week 4 Checkpoint (Non-Negotiable)
- ✅ Anonymous input collection working with pilot customers
- ✅ Basic conflict detection showing team disagreements  
- ✅ At least 1 pilot customer actively using platform for real decisions
- ✅ Clear customer feedback on value recognition and payment willingness

### Week 8 MVP Goal
- ✅ 5 paying healthcare teams at $129-172/month
- ✅ $500+ MRR with customer retention
- ✅ Technical foundation scaling to 100+ teams

## TECHNOLOGY STACK (APPROVED) ✅

```typescript
// Frontend Stack
Framework: Next.js 14 + TypeScript + Tailwind CSS
State Management: React Context + React Query for server state
UI Components: Shadcn/ui + Radix UI primitives
Forms: React Hook Form + Zod validation

// Backend Stack
API: Next.js API Routes + tRPC for type safety
Database: PostgreSQL with Prisma ORM
Authentication: NextAuth.js with multi-tenant team support
File Storage: Vercel Blob for document exports
Email: Resend for team invitations and notifications

// Infrastructure
Hosting: Vercel (frontend + API)
Database: Supabase PostgreSQL with Row Level Security
Monitoring: Vercel Analytics + error tracking
Deployment: GitHub Actions CI/CD
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

## CRITICAL PATH: Database Schema + Authentication MUST Work for Week 1 Demo

**EXECUTE with urgency** - first-mover advantage in unoccupied team decision facilitation market category.

**Reference**: `/docs/TECHNICAL_ARCHITECTURE_PLAN.md` for complete specifications
**Budget**: $25K Phase 1 MVP (weeks 1-8), $25K Phase 2 expansion

## 🚀 START DEVELOPMENT IMMEDIATELY - FIRST-MOVER ADVANTAGE DEPENDS ON VELOCITY
