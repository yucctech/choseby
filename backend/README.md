# Choseby Backend - Customer Response Decision Intelligence

Go/Gin API server for customer response team decision workflows.

## Quick Start

```bash
# Install dependencies
go mod download

# Run tests (10 seconds)
make local

# Start server
make run
```

## Testing (Important!)

### ⚠️ CRITICAL: NEVER Claim Completion Without Running Tests

**MANDATORY before marking any task complete:**
```bash
make local  # Format check + go vet + unit tests (10 sec)
make test   # All tests (unit + integration)
```

**RED FLAGS - If you see these, you're doing it wrong:**
- ❌ "Tests created" ≠ "Tests passing"
- ❌ "Code compiles" ≠ "Code works"
- ❌ "Migration file created" ≠ "Migration applied to database"
- ❌ `go build` succeeds ≠ `make test` passes

**Before every push:**
```bash
make local  # Format check + go vet + fast tests (10 sec)
```

**GitHub Actions runs automatically** on every push as safety net.

### Test Types & Organization

**Go uses idiomatic `*_test.go` files alongside source code:**

```
backend/
├── integration_workflow_test.go          # E2E tests (build tag: integration)
├── performance_benchmark_test.go         # Benchmarks (build tag: integration)
├── internal/
│   ├── handlers/
│   │   ├── auth.go
│   │   ├── auth_test.go                  # Unit tests (no tag, runs by default)
│   │   ├── customer_response.go
│   │   └── customer_response_test.go
│   └── database/
│       ├── database.go
│       └── database_test.go
```

**Build Tags for Test Separation:**
- **Unit tests**: No build tag → run by default with `make test-unit`
- **Integration tests**: `//go:build integration` → run with `make test-integration`
- **Both syntaxes used** for Go 1.17+ compatibility:
  ```go
  //go:build integration
  // +build integration
  ```

### Common Commands

```bash
make help           # Show all commands
make local          # Quick validation before push ⭐
make test           # Run all tests (unit + integration)
make test-unit      # Fast unit tests only
make test-integration  # Slow E2E tests only
make test-coverage  # View HTML coverage report
make benchmark      # Run performance benchmarks
make lint           # Run linter (50+ checks)
make fmt            # Auto-format code
make ci             # Full validation (matches GitHub Actions)
```

### When Tests Fail

```bash
# Locally:
make local
# ❌ Failed

make test  # See details
# Fix issue, then:
make local
# ✅ Passed

# On GitHub:
git push
# ❌ Red X appears
# Click X to see which test failed
# Fix locally, push again
```

### Testing Philosophy (MVP)

- **Current:** 22.5% coverage baseline
- **Target:** 15% minimum (MVP) → 60%+ (production)
- **Focus:** Ship features first, improve coverage gradually
- **Strategy:** Fast local feedback (`make local`) + mandatory GitHub Actions
- **Test Organization:** Go-idiomatic scattered `*_test.go` files (NOT separate `test/` folder)

## Architecture

- **Framework:** Go 1.21 + Gin
- **Database:** PostgreSQL (Supabase)
- **Authentication:** JWT
- **AI:** DeepSeek API
- **Deployment:** Render.com

## Documentation

- **API Specs:** [docs/technical/api-specifications.md](../docs/technical/api-specifications.md)
- **Database:** [docs/technical/database-schema.md](../docs/technical/database-schema.md)
- **Project Context:** [CLAUDE.md](../CLAUDE.md)

## Project Structure

```
backend/
├── main.go                    # Entry point
├── internal/
│   ├── api/                   # API router
│   ├── handlers/              # HTTP handlers
│   ├── models/                # Data models
│   ├── database/              # DB connection
│   ├── auth/                  # Authentication
│   └── middleware/            # HTTP middleware
└── Makefile                   # Dev commands
```

## Environment Variables

```bash
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
DEEPSEEK_API_KEY=your-api-key
```

See `.env.example` for complete list.

## Health Check

```bash
curl http://localhost:8080/api/v1/health
```

## More Information

See main project [CLAUDE.md](../CLAUDE.md) for complete context.