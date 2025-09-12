# Copilot Context

**Stack**: Next.js 14 + TypeScript + Supabase + Tailwind + Shadcn/ui  
**Focus**: Team decision platform, multi-tenant RLS, anonymous scoring

## Key Patterns
```typescript
// RLS Policy Template
CREATE POLICY "team_access" ON {table} FOR ALL USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

// Supabase Auth Check  
const { data: session } = await supabase.auth.getSession()

// Component Pattern
import { Button } from "@/components/ui/button"

// API Route Pattern
export async function POST(request: Request) {
  const supabase = createClient()
  // RLS automatically filters by team
}
```

## Architecture
- **Multi-tenant**: All data isolated by `team_id` with RLS
- **Anonymous**: Private scoring, no cross-team visibility  
- **Real-time**: Supabase subscriptions for collaboration
- **FREE tier**: 500MB DB, 50K users, 1GB storage limits

## References
- Architecture: `docs/technical/architecture.md`
- Database Schema: `docs/technical/database-schema.md`
- Current Tasks: `docs/current/ACTIVE_TASKS.md`