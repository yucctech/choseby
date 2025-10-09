# Local Linting Guide - MUST READ Before Every Commit

## 🚨 CRITICAL: Always Validate Locally BEFORE Pushing

**Golden Rule:** Your local environment MUST use the EXACT same tools and configurations as CI/CD.

## Why This Matters

The CI/CD pipeline uses `golangci-lint` with 50+ linters including:
- **gofumpt** - Stricter formatter than `gofmt` (removes extra blank lines)
- **gci** - Import ordering and formatting
- **errorlint** - Enforces `errors.Is()` for error comparison
- **gosec** - Security checks (file permissions, etc.)
- **And 40+ more linters**

Running only `go fmt` or `go vet` locally will NOT catch all issues.

## Required Tools Installation

```bash
# Install gofumpt (stricter formatter)
go install mvdan.cc/gofumpt@latest

# Install golangci-lint (meta-linter with 50+ linters)
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# Install gci (import formatter)
go install github.com/daixiang0/gci@latest
```

## Local Validation Workflow

### Option 1: Using Makefile (Linux/Mac)

```bash
# Quick validation (< 10 seconds) - Run BEFORE every commit
make local

# Full CI pipeline locally (with test coverage)
make ci
```

### Option 2: Manual Commands (Windows or No Make)

```bash
# 1. Format code with gofumpt (matches CI/CD)
gofumpt -w .

# 2. Run static analysis
go vet ./...

# 3. Build to catch compilation errors
go build ./...

# 4. (Optional) Run full golangci-lint if needed
golangci-lint run --config .golangci.yml
```

## Pre-Commit Checklist

Before EVERY commit, run these commands in the `backend/` directory:

```bash
# Windows (no make command)
gofumpt -w . && go vet ./... && go build ./...

# Linux/Mac (with make)
make local
```

**Expected output:** No errors. If you see errors, FIX THEM before committing.

## Common Lint Errors and Fixes

### 1. gofumpt - "File is not properly formatted"

**Error:** Extra blank lines after statements
```go
// ❌ WRONG (fails gofumpt)
err := db.QueryRow("SELECT ...").Scan(&result)

if err != nil {
    return err
}

// ✅ CORRECT (passes gofumpt)
err := db.QueryRow("SELECT ...").Scan(&result)
if err != nil {
    return err
}
```

**Fix:** Run `gofumpt -w .`

### 2. errorlint - "Wrong error comparison"

**Error:** Using `==` or `!=` with errors
```go
// ❌ WRONG
if err == sql.ErrNoRows {
    return nil
}

// ✅ CORRECT
if errors.Is(err, sql.ErrNoRows) {
    return nil
}
```

**Fix:** Use `errors.Is()` from the `errors` package

### 3. gosec G306 - "File permissions too open"

**Error:** File created with 0644 permissions
```go
// ❌ WRONG
os.WriteFile("file.json", data, 0644)

// ✅ CORRECT
os.WriteFile("file.json", data, 0600)
```

**Fix:** Use `0600` or `0o600` for file permissions

### 4. gci - "Import formatting issues"

**Error:** Imports not properly grouped/ordered
```go
// ❌ WRONG
import (
    "github.com/gin-gonic/gin"
    "context"
    "choseby-backend/internal/models"
)

// ✅ CORRECT
import (
    "context"

    "choseby-backend/internal/models"
    "github.com/gin-gonic/gin"
)
```

**Fix:** Run `gci write .` or use gofumpt

### 5. revive - "Stuttering package/type name"

**Error:** Package name repeated in type name
```go
// ❌ WRONG
package ai
type AIService struct {}

// ✅ CORRECT
package ai
type Service struct {}
```

**Fix:** Remove package name from type name

## CI/CD Configuration Reference

The GitHub Actions workflow (`.github/workflows/test.yml`) runs:

```yaml
- name: golangci-lint
  uses: golangci/golangci-lint-action@v3
  with:
    version: latest
    working-directory: backend
```

This uses the `.golangci.yml` configuration with ALL enabled linters.

## Debugging Lint Failures

If CI/CD fails but local validation passes:

1. **Check tool versions:** Ensure local tools match CI/CD versions
   ```bash
   gofumpt -version
   golangci-lint --version
   ```

2. **Run exact CI/CD command locally:**
   ```bash
   golangci-lint run --config .golangci.yml
   ```

3. **Check for hidden files:** Some linters check files you might not see
   ```bash
   git ls-files '*.go' | xargs gofumpt -l
   ```

## Disabled Linters (Too Strict)

These linters are disabled in `.golangci.yml` because they're too opinionated:

- `gocritic` - Too opinionated for handler functions
- `godot` - Overly strict comment formatting (requires periods)

## Zero Tolerance Policy

**"I have 0 tolerance on this tricky mistake on CI/CD"**

- ALWAYS run local validation BEFORE commit
- NEVER push code that hasn't been locally validated
- Use the SAME tools that CI/CD uses (not just `go fmt`)

## Quick Reference Card

```bash
# Before EVERY commit (Windows)
gofumpt -w . && go vet ./... && go build ./...

# Before EVERY commit (Linux/Mac)
make local

# Full validation before major push
golangci-lint run --config .golangci.yml
```

**Remember:** 10 seconds of local validation saves 10 minutes of CI/CD debugging!
