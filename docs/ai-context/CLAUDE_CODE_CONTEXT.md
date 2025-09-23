# Claude Code Context

**Product**: Team Decision Platform (5-8 person teams) | **Target**: Healthcare first, $500+ MRR Week 8
**Status**: 🚀 **DEPLOYED & LIVE** | **Budget**: $50K MVP | **Pricing**: $107-172/month teams, $21.50/user individual (post-MVP)

## 🌐 **Live Platform URLs**
- **Frontend**: https://choseby.vercel.app ✅
- **Backend API**: https://choseby.onrender.com ✅
- **Health Check**: https://choseby.onrender.com/api/v1/health ✅
- **Database**: Supabase PostgreSQL with healthcare schemas ✅

## Tech Stack (DEPLOYED)
- **Frontend**: Next.js 14 + TypeScript + Tailwind (Vercel deployment)
- **Backend**: Go/Gin API server (Render deployment)
- **Database**: Supabase PostgreSQL with HIPAA-compliant schemas
- **Authentication**: JWT + healthcare SSO integration ready
- **Real-time**: WebSocket support for team collaboration

## Current Priority: Healthcare Team Onboarding
1. Pilot customer acquisition (Target: 5 healthcare teams)
2. Revenue generation ($500+ MRR by Week 8)
3. Platform optimization based on real user feedback
4. Healthcare compliance verification
5. Scale preparation for 15+ teams by Week 16

## Code Patterns
- **RLS**: `team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())`
- **Auth**: Supabase session management, team context
- **UI**: Shadcn/ui + Tailwind, forms with React Hook Form + Zod
- **State**: React Context + React Query

## Success: Week 4 pilot customers using anonymous scoring, Week 8 five paying teams

## References
- Technical Details: `docs/technical/`
- Current Tasks: `docs/current/`
- Business Context: `docs/business/`
- Architecture Decisions: `docs/decisions/`
- **Team Workflows**: `docs/current/WORKFLOW_PROCESSES.md` (coordination with business priorities)

## Important Technical Context
**For individual features post-MVP**: Reference `docs/business/future-features/ai-individual-platform-research.md` for DeepSeek R1 specifications and AI integration architecture already validated.