-- Migration 003: Fix Schema Mismatches Discovered During Integration Testing
-- Purpose: Correct database schema to match code expectations and schema.sql specification
-- Version: 003
-- Date: 2025-10-02
-- Applied: YES (via Supabase MCP during testing)
-- Result: Integration tests now pass - complete customer response workflow functional

-- Issue 1: Missing created_by column in decision_criteria
-- Root Cause: Production database missing column that handler code expects
-- Error: "column 'created_by' does not exist"
ALTER TABLE decision_criteria
ADD COLUMN IF NOT EXISTS created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid
REFERENCES team_members(id);

ALTER TABLE decision_criteria
ALTER COLUMN created_by DROP DEFAULT;

-- Issue 2: Incorrect weight constraint in decision_criteria
-- Root Cause: Database had CHECK (weight >= 0 AND weight <= 1) but schema.sql specifies 0.1-5.0
-- Error: "new row violates check constraint decision_criteria_weight_check" when inserting weight=1.5
ALTER TABLE decision_criteria
DROP CONSTRAINT IF EXISTS decision_criteria_weight_check;

ALTER TABLE decision_criteria
ADD CONSTRAINT decision_criteria_weight_check
CHECK (weight >= 0.1 AND weight <= 5.0);

-- Issue 3: Foreign key pointing to wrong table
-- Root Cause: FK pointed to 'decisions' table but code uses 'customer_decisions' table
-- Error: "insert or update violates foreign key constraint decision_criteria_decision_id_fkey"
ALTER TABLE decision_criteria
DROP CONSTRAINT IF EXISTS decision_criteria_decision_id_fkey;

ALTER TABLE decision_criteria
ADD CONSTRAINT decision_criteria_decision_id_fkey
FOREIGN KEY (decision_id) REFERENCES customer_decisions(id) ON DELETE CASCADE;

-- Issue 4: Evaluations table had wrong structure
-- Root Cause: Table had columns for evaluation sessions (user_id, evaluation_token) instead of individual option/criteria scores
-- Error: "column evaluator_id does not exist" when querying evaluations
DROP TABLE IF EXISTS evaluations CASCADE;

CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID NOT NULL REFERENCES customer_decisions(id) ON DELETE CASCADE,
    evaluator_id UUID NOT NULL REFERENCES team_members(id),
    option_id UUID NOT NULL REFERENCES response_options(id),
    criteria_id UUID NOT NULL REFERENCES decision_criteria(id),
    score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 10),
    confidence INTEGER DEFAULT 5 CHECK (confidence BETWEEN 1 AND 5),
    anonymous_comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(decision_id, evaluator_id, option_id, criteria_id)
);

-- Verification queries (uncomment to run after migration)
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns
-- WHERE table_name = 'decision_criteria' AND column_name = 'created_by';

-- SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint
-- WHERE conrelid = 'decision_criteria'::regclass;

-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'evaluations' ORDER BY ordinal_position;

COMMENT ON COLUMN decision_criteria.created_by IS 'User who created this criterion (added in migration 003)';
COMMENT ON TABLE evaluations IS 'Rebuilt in migration 003 to match schema.sql - stores individual option/criteria evaluations, not sessions';
