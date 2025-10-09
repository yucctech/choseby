# Manual Test Scripts

These scripts are for manual testing and debugging specific features.

## Usage

**Run from repository root**:
```bash
# Full E2E workflow test
node scripts/test/test-complete-e2e-workflow.js

# Analytics dashboard test
node scripts/test/test-analytics.js

# Outcome tracking test
node scripts/test/test-phase-6-outcome.js
```

**Backend must be running**:
```bash
cd backend && go run main.go
```

## When to Use

- 🐛 Debugging specific feature issues
- 🧪 Manual validation before major releases
- 📊 Verifying data flows end-to-end

## Automated Tests

For regular testing, use the automated Go tests:
```bash
cd backend && make local  # Fast validation (10 sec)
cd backend && make test   # Full test suite
```

These run automatically via:
- Git pre-commit hook
- GitHub Actions on push

See `docs/TESTING_STRATEGY.md` for complete testing workflow.
