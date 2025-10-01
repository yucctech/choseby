# Apply Migration 002: Response Drafts & Outcome Tracking

## Migration File
`backend/database/migrations/002_add_response_drafts.sql`

## Manual Application Instructions

### Option 1: Supabase SQL Editor (Recommended)
1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Copy the entire contents of `002_add_response_drafts.sql`
3. Paste into SQL Editor
4. Click "Run"
5. Verify success (should see "Success. No rows returned")

### Option 2: Command Line (if psql available)
```bash
psql $DATABASE_URL -f backend/database/migrations/002_add_response_drafts.sql
```

## What This Migration Adds

### New Tables:
1. **response_drafts** - AI-generated customer response drafts with versioning
   - Draft content, tone, key points, satisfaction impact
   - Version tracking for regeneration
   - Team consensus score at time of generation

2. **ai_recommendation_feedback** - Track AI accuracy for continuous improvement
   - Classification, stakeholder suggestions, response drafts
   - Approval ratings, accuracy scores
   - Improvement suggestions from team

### Enhanced Tables:
3. **outcome_tracking** - New fields added:
   - `ai_classification_accurate` (BOOLEAN) - Was AI classification correct?
   - `response_draft_used` (BOOLEAN) - Did team use AI draft?
   - `response_draft_version` (INTEGER) - Which version was used?

### Performance Indexes:
- `idx_response_drafts_decision_id` - Fast lookup by decision
- `idx_response_drafts_created_at` - Time-based queries
- `idx_response_drafts_version` - Version retrieval
- `idx_ai_feedback_decision_id` - Feedback lookup
- `idx_ai_feedback_recommendation_type` - Type filtering
- `idx_ai_feedback_alignment` - Accuracy analysis

## Verification Queries

After applying, verify with:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('response_drafts', 'ai_recommendation_feedback');

-- Check outcome_tracking columns added
SELECT column_name FROM information_schema.columns
WHERE table_name = 'outcome_tracking'
AND column_name IN ('ai_classification_accurate', 'response_draft_used', 'response_draft_version');

-- Check indexes created
SELECT indexname FROM pg_indexes
WHERE tablename IN ('response_drafts', 'ai_recommendation_feedback');
```

Expected results:
- 2 tables: response_drafts, ai_recommendation_feedback
- 3 new columns in outcome_tracking
- 6 indexes total

## Rollback (if needed)

If migration fails or needs rollback:

```sql
DROP TABLE IF EXISTS ai_recommendation_feedback CASCADE;
DROP TABLE IF EXISTS response_drafts CASCADE;

ALTER TABLE outcome_tracking
  DROP COLUMN IF EXISTS ai_classification_accurate,
  DROP COLUMN IF EXISTS response_draft_used,
  DROP COLUMN IF EXISTS response_draft_version;
```

## Status
- [x] Migration file created
- [ ] Applied to Supabase (manual step required)
- [ ] Verification queries run
- [ ] Backend tested against new schema
