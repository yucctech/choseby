# COMPLETION CHECKLIST - MANDATORY BEFORE CLAIMING "DONE"

**⚠️ THIS FILE PREVENTS FALSE COMPLETION CLAIMS**
**Purpose**: Force explicit verification steps before marking ANY work complete

---

## 🚨 CRITICAL RULE: SHOW, DON'T TELL

**NEVER say "tests pass" - ALWAYS paste the actual test output**

Examples:
- ❌ "All tests are passing"
- ❌ "Integration tests succeeded"
- ✅ [Paste actual terminal output showing PASS]
- ✅ [Show `make test` results with green checkmarks]

---

## BACKEND COMPLETION CHECKLIST

Before claiming ANY backend task complete, you MUST:

### 1. Run Tests (MANDATORY)
```bash
cd backend
bash run_integration_tests.sh
```

**Paste the output showing**:
- [ ] `--- PASS: TestCustomerResponseWorkflowE2E`
- [ ] No `--- FAIL:` messages
- [ ] No `panic:` or `FATAL` errors

### 2. Verify Database Changes (if schema modified)
```bash
# If you created a migration file, verify it's applied
```

**Confirm**:
- [ ] Migration SQL actually executed (not just file created)
- [ ] Tables/columns exist in database (run SELECT query)
- [ ] Foreign keys point to correct tables

### 3. Check Compilation
```bash
cd backend
go build ./...
```

**Paste output showing**:
- [ ] No compilation errors
- [ ] All packages build successfully

---

## FRONTEND COMPLETION CHECKLIST

Before claiming ANY frontend task complete, you MUST:

### 1. Run Build
```bash
cd frontend
npm run build
```

**Paste output showing**:
- [ ] Build succeeded
- [ ] No TypeScript errors
- [ ] No ESLint failures

### 2. Run Tests (if tests exist)
```bash
npm test
```

**Paste output showing**:
- [ ] Test suite passed
- [ ] Coverage meets minimum threshold

---

## MIGRATION COMPLETION CHECKLIST

Before claiming a migration is "applied", you MUST:

### 1. Execute the SQL
```bash
# Use Supabase MCP or psql to run migration
```

**Provide proof**:
- [ ] Copy/paste the SQL execution confirmation
- [ ] Show query result: "Migration applied successfully"

### 2. Verify Schema Changes
```sql
-- Check table exists
SELECT table_name FROM information_schema.tables WHERE table_name = 'new_table';

-- Check column exists
SELECT column_name FROM information_schema.columns WHERE table_name = 'table' AND column_name = 'new_column';
```

**Paste query results showing**:
- [ ] Table/column exists
- [ ] Constraints are correct

---

## DOCUMENTATION COMPLETION CHECKLIST

Before claiming documentation is "updated", you MUST:

### 1. Verify File Contents
```bash
cat path/to/file.md | grep "key phrase"
```

**Show proof**:
- [ ] File contains the claimed updates
- [ ] No placeholder text like "TODO" or "TBD"

---

## WEEK/SPRINT COMPLETION CHECKLIST

Before claiming "Week X complete" or "Sprint Y done", you MUST:

### 1. Run Full Validation Suite
```bash
cd backend
make test              # All unit + integration tests
make test-integration  # E2E workflow tests
go build ./...         # Compilation check
```

### 2. Verify Success Criteria
**For each criterion in `docs/current/active-tasks.md`:**
- [ ] Paste evidence (test output, query result, screenshot)
- [ ] Link to commit where work was done
- [ ] Show database verification queries

### 3. Check No Regressions
```bash
# Run tests that were passing before
# Confirm they still pass
```

---

## RED FLAGS - STOP IF YOU SEE THESE

### 🚩 You're About to Make False Claims If:

1. **No Test Output Pasted**
   - You say "tests pass" without showing terminal output
   - You claim "all green" without evidence

2. **Compilation != Tests**
   - `go build` succeeded ≠ `go test` passed
   - `npm run build` succeeded ≠ tests passed

3. **File Created != Changes Applied**
   - Migration file exists ≠ migration executed
   - Test file exists ≠ tests run
   - Code written ≠ code working

4. **Assumed Success**
   - "Should work now"
   - "This will fix it"
   - "Tests should pass"

   **Actual success**: "Here's the test output showing PASS"

---

## ENFORCEMENT MECHANISM

### For Future AI Sessions:

**On session start, ALWAYS read this file first**

Before claiming completion of ANY task:
1. Open this file
2. Find relevant checklist section
3. Complete EVERY checkbox
4. Paste actual evidence (not claims)
5. ONLY THEN say "task complete"

### If User Asks "Is X done?":

**WRONG**: "Yes, X is done"

**RIGHT**:
```
Let me verify by running tests:
[Run tests]
[Paste output]
Yes, X is done. Here's the proof: [link to output above]
```

---

## LESSON FROM WEEK 1 FAILURE

**What Happened**:
- Claimed "Week 1 complete, tests passing"
- Only ran `go build` (compilation check)
- Never ran `go test` or integration tests
- Discovered 4 critical database schema bugs later

**Time Wasted**: 2+ hours debugging bugs that would have been caught in 5 minutes by running tests

**Root Cause**: No forcing function to prevent false claims

**This File Is The Solution**: Explicit checklists that MUST be completed before claiming "done"

---

## QUICK REFERENCE: "AM I DONE?"

```
Step 1: Run the actual validation command
Step 2: See PASS/SUCCESS in output?
  → YES: Paste output, claim done ✅
  → NO: Fix failures, repeat Step 1 ❌
Step 3: If no tests exist, write tests first
```

**Remember**:
- "Tests created" ≠ "Tests passing"
- "Code written" ≠ "Code working"
- "Should work" ≠ "Does work"

---

**Last Updated**: 2025-10-02 (after Week 1 false completion incident)
**Next Review**: After any false completion claim (update enforcement)
