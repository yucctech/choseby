# Choseby Backend - Customer Response Decision Intelligence

Go/Gin API server for customer response team decision workflows.

## Quick Start

```bash
# Install dependencies
go mod download

# Run local validation (MUST DO before every commit!)
make local  # Or: gofumpt -w . && go vet ./... && go build ./...

# Start server
make run
```

## 🚨 CRITICAL: Local Linting (MUST READ!)

**Before EVERY commit, you MUST validate locally with the SAME tools as CI/CD.**

See **[LOCAL_LINT_GUIDE.md](LOCAL_LINT_GUIDE.md)** for complete instructions.

**Quick validation (Windows):**
```bash
gofumpt -w . && go vet ./... && go build ./...
```

**Quick validation (Linux/Mac):**
```bash
make local
```

**Why this matters:** CI/CD uses `golangci-lint` with 50+ linters including `gofumpt` (stricter than `gofmt`). Running only `go fmt` will NOT catch all issues!

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

- **Current Status:** Integration tests validate E2E workflow, handler unit tests removed (tech debt)
- **Strategy:** Integration tests > shallow unit tests (following docs/testing/README.md)
- **Local Development:** Run `go test -v ./...` - AI accuracy may vary locally (60-100%)
- **CI/CD:** GitHub Actions runs integration tests against Supabase dev database
- **Test Organization:** Go-idiomatic scattered `*_test.go` files (NOT separate `test/` folder)

### What Tests We Have:

**✅ Integration Tests** (Validate System Works):
- `integration_workflow_test.go` - Complete E2E customer response workflow
- `performance_benchmark_test.go` - Response time requirements

**✅ AI Accuracy Tests** (Validate Business Logic):
- `internal/ai/classification_accuracy_test.go` - AI classification quality
- `internal/ai/pollinations_accuracy_test.go` - Free tier AI validation
- `internal/ai/modelscope_accuracy_test.go` - Alternative AI provider

**✅ Database Tests**:
- `internal/database/database_test.go` - Database wrapper functionality
- `internal/auth/auth_test.go` - Password hashing validation

**❌ Handler Unit Tests** (Removed - Tech Debt):
- Removed brittle mock-based tests that tested implementation details
- Will add proper business logic tests after MVP (see docs/testing/README.md:165-170)
- Integration tests already validate handlers work correctly

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