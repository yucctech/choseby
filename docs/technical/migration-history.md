# Database Migration History

**Track all applied database migrations for Customer Response Platform**

---

## Migration 001: Customer Response Context Fields
**Status**: ✅ Applied to Supabase (Choseby-dev)
**Date Applied**: Week 1, Day 1 (January 8, 2025)
**File**: `backend/database/migrations/001_add_customer_response_fields.sql`

### What Was Added:
- **7 new customer context fields** in `customer_decisions` table:
  - `customer_tier_detailed` (bronze/silver/gold/platinum)
  - `urgency_level_detailed` (low/medium/high/critical)
  - `customer_impact_scope` (user/team/department/company)
  - `relationship_history` (TEXT for context)
  - `previous_issues_count` (INTEGER)
  - `last_interaction_date` (TIMESTAMP)
  - `nps_score` (INTEGER 0-100)

- **customer_response_types** table (10 standard response types):
  - Refund request, billing dispute, escalation, churn prevention, etc.
  - AI classification keywords for automatic issue categorization
  - Default stakeholders, resolution times, escalation requirements

- **outcome_tracking** table (initial version):
  - Customer satisfaction tracking (1-10 score)
  - Resolution time, escalation levels
  - Retention impact, follow-up tracking
  - Financial impact correlation

### Verification:
```sql
-- Verify migration 001 applied
SELECT column_name FROM information_schema.columns
WHERE table_name = 'customer_decisions'
AND column_name IN ('customer_tier_detailed', 'urgency_level_detailed', 'customer_impact_scope');

SELECT COUNT(*) FROM customer_response_types; -- Should return 10 types
```

---

## Migration 002: Response Drafts & AI Learning
**Status**: ✅ Created, ⏳ Pending Manual Application
**Date Created**: Week 1, Day 4 (January 11, 2025)
**File**: `backend/database/migrations/002_add_response_drafts.sql`

### What This Adds:

**New Tables:**
1. **response_drafts** - AI-generated customer response drafts
   - Draft content with version tracking (v1, v2, v3...)
   - 4 communication tones (professional_empathetic, formal_corporate, friendly_apologetic, concise_factual)
   - Key points, satisfaction impact estimates
   - Team consensus score at generation time
   - Based on selected response option

2. **ai_recommendation_feedback** - AI accuracy tracking
   - Classification, stakeholder suggestions, response drafts, risk assessments
   - Approval ratings (1-5 scale), accuracy scores (0.0-1.0)
   - Final decision alignment tracking
   - Improvement suggestions for continuous learning

**Enhanced Tables:**
3. **outcome_tracking** - 3 new AI learning fields:
   - `ai_classification_accurate` (BOOLEAN) - Was AI's issue classification correct?
   - `response_draft_used` (BOOLEAN) - Did team use the AI-generated draft?
   - `response_draft_version` (INTEGER) - Which draft version was used?

### Application Instructions:

**Option 1: Supabase SQL Editor** (Recommended):
1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Copy contents of `backend/database/migrations/002_add_response_drafts.sql`
3. Paste into SQL Editor
4. Click "Run"
5. Verify success

**Option 2: Command Line** (if psql available):
```bash
psql $DATABASE_URL -f backend/database/migrations/002_add_response_drafts.sql
```

### Verification:
```sql
-- Check new tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('response_drafts', 'ai_recommendation_feedback');

-- Check outcome_tracking enhancements
SELECT column_name FROM information_schema.columns
WHERE table_name = 'outcome_tracking'
AND column_name IN ('ai_classification_accurate', 'response_draft_used', 'response_draft_version');

-- Check indexes
SELECT indexname FROM pg_indexes
WHERE tablename IN ('response_drafts', 'ai_recommendation_feedback');
```

**Expected Results:**
- 2 new tables: `response_drafts`, `ai_recommendation_feedback`
- 3 new columns in `outcome_tracking`
- 6 performance indexes

### Rollback (if needed):
```sql
DROP TABLE IF EXISTS ai_recommendation_feedback CASCADE;
DROP TABLE IF EXISTS response_drafts CASCADE;

ALTER TABLE outcome_tracking
  DROP COLUMN IF EXISTS ai_classification_accurate,
  DROP COLUMN IF EXISTS response_draft_used,
  DROP COLUMN IF EXISTS response_draft_version;
```

---

## Migration Best Practices

### Before Applying Any Migration:
1. ✅ Review SQL file for syntax errors
2. ✅ Backup current database (Supabase: Project Settings → Database → Backups)
3. ✅ Test in development environment first
4. ✅ Run verification queries after application
5. ✅ Update this file with application date/status

### Migration Naming Convention:
`XXX_descriptive_name.sql` where XXX is sequential number (001, 002, 003...)

### Rollback Strategy:
- Always include rollback SQL in migration documentation
- Test rollback procedure in development first
- Keep previous backup until migration fully validated

---

## Next Migrations (Planned)

**Migration 003**: [Future - Week 2+]
- To be determined based on frontend development needs
- Potential: Real-time collaboration features, notification preferences

---

**Last Updated**: Week 1, Day 5 (January 12, 2025)
**Current Database Version**: Migration 001 applied, Migration 002 pending manual application
