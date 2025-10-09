# Testing Strategy

## Automated Tests (Run on Every Commit)

### Backend Go Tests - **PERMANENT** ✅
Location: `backend/*_test.go`, `backend/internal/**/*_test.go`

**Runs Automatically**:
1. Local: `make local` before push (10 sec validation)
2. GitHub Actions: On every push (full test suite)

**Coverage**:
- Integration test: Full workflow (E2E)
- Unit tests: Handler logic, auth, database
- Baseline: 22.5% coverage → Target: 60%+ after customers

**Never delete these** - they're your safety net!

---

## Manual Test Scripts

### Keep for Manual Testing (Move to `scripts/test/`)
- `test-complete-e2e-workflow.js` - Full workflow validation
- `test-analytics.js` - Analytics dashboard validation
- `test-phase-6-outcome.js` - Outcome tracking validation

**Usage**: Run manually when debugging specific features
**Location**: Move to `scripts/test/` directory

### Delete (One-Time Debug Scripts)
These were created during development and are no longer needed:
- `check-evaluations-db.js`
- `debug-outcome-response.js`
- `debug-request-payload.js`
- `delete-outcome.js`
- `test-integration-validation.js`
- `test-decision-detail.js`
- `test-decisions-list.js`
- `test-results-endpoint.js`
- `test-tiers.js`
- `test-frontend-decision-workflow.js`
- `test-decision-detail-page.js`
- `test-workflow-phases-1-4.js`
- `test-phase-5-results.js`
- `verify-analytics-spec.js`

---

## Testing Workflow

### Before Commit (Automatic via Git Hook)
```bash
cd backend && make local
```
- Runs in 10 seconds
- Catches most issues
- Format + vet + quick tests

### On Push (Automatic via GitHub Actions)
- Full test suite
- Integration tests
- golangci-lint (50+ checks)
- Security scan (gosec)

### Manual Testing (When Needed)
```bash
# Test specific feature
node scripts/test/test-complete-e2e-workflow.js

# Test analytics
node scripts/test/test-analytics.js
```

---

## Test Maintenance

### When to Update Tests
- ✅ Add new feature → Add unit test
- ✅ Fix bug → Add regression test
- ✅ Change API → Update integration test
- ❌ Don't write tests just for coverage

### Philosophy
- **Fast feedback**: `make local` catches 90% of issues
- **Safety net**: GitHub Actions catches the rest
- **Quality over coverage**: 1 good integration test > 100 shallow unit tests
- **Test what matters**: Business logic, not boilerplate

---

## Current Status
- ✅ Integration test: FIXED (now validates data, not just HTTP 200)
- ✅ Unit tests: Need updating (test old schema)
- ✅ Pre-commit hook: Working
- ✅ GitHub Actions: Working
- ⚠️ Manual scripts: 55KB of one-time debug code (ready to clean up)
