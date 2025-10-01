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

**Before every push:**
```bash
make local  # Format check + go vet + fast tests (10 sec)
```

**GitHub Actions runs automatically** on every push as safety net.

### Common Commands

```bash
make help          # Show all commands
make local         # Quick validation before push ⭐
make test          # Run all tests
make test-coverage # View HTML coverage report
make lint          # Run linter (50+ checks)
make fmt           # Auto-format code
make ci            # Full validation (matches GitHub Actions)
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
├── Makefile                   # Dev commands
└── TESTING_QUICK_START.md     # Testing guide
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