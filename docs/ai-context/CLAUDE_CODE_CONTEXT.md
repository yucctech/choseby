# Claude Code Context

**Product**: Team Decision Platform (5-8 person teams) | **Target**: Healthcare first, $500+ MRR Week 8  
**Status**: Week 1 foundation | **Budget**: $50K MVP | **Pricing**: $107-172/month teams, $21.50/user individual (post-MVP)

## Tech Stack (FREE → $45/month)
- **Frontend**: Next.js 14 + TypeScript + Tailwind + Shadcn/ui
- **Backend**: Supabase PostgreSQL + Auth + Storage + Vercel Edge Functions  
- **Security**: Row Level Security for multi-tenant team isolation

## Week 1 Tasks (Priority Order)
1. Supabase project + Vercel connection (FREE tier)
2. Database schema + RLS policies (`docs/technical/database-schema.md`)
3. Supabase Auth + team-based sessions
4. UI component library (Shadcn/ui)
5. CI/CD pipeline setup

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