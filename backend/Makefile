# Choseby Backend - Modern Go Development Makefile

.PHONY: help build run test test-unit test-integration test-coverage clean lint lint-fix fmt deps docker dev-setup benchmark security audit ci-test

# Colors for output
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RED    := \033[0;31m
NC     := \033[0m # No Color

# Go parameters
GOCMD=go
GOBUILD=$(GOCMD) build
GOCLEAN=$(GOCMD) clean
GOTEST=$(GOCMD) test
GOGET=$(GOCMD) get
GOMOD=$(GOCMD) mod
BINARY_NAME=choseby-backend
BINARY_UNIX=$(BINARY_NAME)_unix
BUILD_DIR=bin

# Test parameters
TEST_TIMEOUT=10m
COVERAGE_FILE=coverage.out
COVERAGE_HTML=coverage.html

# Default target
help: ## Show this help message
	@echo "$(GREEN)Choseby Backend - Available Commands:$(NC)"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

# Build targets
build: ## Build the application
	@echo "$(GREEN)Building application...$(NC)"
	mkdir -p $(BUILD_DIR)
	$(GOBUILD) -v -ldflags="-w -s" -o $(BUILD_DIR)/$(BINARY_NAME) ./main.go

build-linux: ## Build for Linux
	@echo "$(GREEN)Building for Linux...$(NC)"
	mkdir -p $(BUILD_DIR)
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 $(GOBUILD) -a -installsuffix cgo -ldflags="-w -s" -o $(BUILD_DIR)/$(BINARY_UNIX) ./main.go

# Run targets
run: ## Run the application
	@echo "$(GREEN)Running application...$(NC)"
	$(GOCMD) run main.go

dev: ## Run in development mode with hot reload
	@echo "$(GREEN)Starting development server...$(NC)"
	air || $(GOCMD) run main.go

# Test targets
test: test-unit test-integration ## Run all tests

test-unit: ## Run unit tests
	@echo "$(GREEN)Running unit tests...$(NC)"
	$(GOTEST) -v -race -timeout $(TEST_TIMEOUT) -tags=unit ./...

test-integration: ## Run integration tests
	@echo "$(GREEN)Running integration tests...$(NC)"
	$(GOTEST) -v -race -timeout $(TEST_TIMEOUT) -tags=integration ./...

test-coverage: ## Run tests with coverage report
	@echo "$(GREEN)Running tests with coverage...$(NC)"
	$(GOTEST) -v -race -timeout $(TEST_TIMEOUT) -coverprofile=$(COVERAGE_FILE) -covermode=atomic ./...
	$(GOCMD) tool cover -html=$(COVERAGE_FILE) -o $(COVERAGE_HTML)
	$(GOCMD) tool cover -func=$(COVERAGE_FILE)
	@echo "$(YELLOW)Coverage report: $(COVERAGE_HTML)$(NC)"

test-short: ## Run short tests
	@echo "$(GREEN)Running short tests...$(NC)"
	$(GOTEST) -v -race -short ./...

benchmark: ## Run benchmark tests
	@echo "$(GREEN)Running benchmarks...$(NC)"
	$(GOTEST) -v -bench=. -benchmem ./...

ci-test: ## Run tests for CI environment
	@echo "$(GREEN)Running CI tests...$(NC)"
	$(GOTEST) -v -race -timeout $(TEST_TIMEOUT) -coverprofile=$(COVERAGE_FILE) -covermode=atomic ./...

# Code quality targets
lint: ## Run linter
	@echo "$(GREEN)Running linter...$(NC)"
	golangci-lint run --config .golangci.yml

lint-fix: ## Run linter with auto-fix
	@echo "$(GREEN)Running linter with auto-fix...$(NC)"
	golangci-lint run --config .golangci.yml --fix

fmt: ## Format code
	@echo "$(GREEN)Formatting code...$(NC)"
	$(GOCMD) fmt ./...
	goimports -w .
	gofumpt -w .

vet: ## Run go vet
	@echo "$(GREEN)Running go vet...$(NC)"
	$(GOCMD) vet ./...

# Security targets
security: ## Run security scan
	@echo "$(GREEN)Running security scan...$(NC)"
	gosec -fmt json -out gosec-report.json -stdout ./...

audit: ## Run dependency audit
	@echo "$(GREEN)Running dependency audit...$(NC)"
	$(GOCMD) list -json -deps ./... | nancy sleuth

# Dependency management
deps: ## Download and tidy dependencies
	@echo "$(GREEN)Managing dependencies...$(NC)"
	$(GOMOD) download
	$(GOMOD) tidy
	$(GOMOD) verify

deps-update: ## Update dependencies
	@echo "$(GREEN)Updating dependencies...$(NC)"
	$(GOGET) -u all
	$(GOMOD) tidy

deps-graph: ## Generate dependency graph
	@echo "$(GREEN)Generating dependency graph...$(NC)"
	$(GOCMD) mod graph | modgraphviz | dot -Tpng -o deps.png

# Database targets
db-migrate: ## Run database migrations
	@echo "$(GREEN)Running database migrations...$(NC)"
	migrate -path ./migrations -database "$(DATABASE_URL)" up

db-rollback: ## Rollback last migration
	@echo "$(GREEN)Rolling back last migration...$(NC)"
	migrate -path ./migrations -database "$(DATABASE_URL)" down 1

db-reset: ## Reset database
	@echo "$(GREEN)Resetting database...$(NC)"
	migrate -path ./migrations -database "$(DATABASE_URL)" drop -f
	migrate -path ./migrations -database "$(DATABASE_URL)" up

# Docker targets
docker: ## Build Docker image
	@echo "$(GREEN)Building Docker image...$(NC)"
	docker build -t choseby-backend:latest .

docker-run: ## Run Docker container
	@echo "$(GREEN)Running Docker container...$(NC)"
	docker run -p 8080:8080 choseby-backend:latest

docker-compose: ## Run with docker-compose
	@echo "$(GREEN)Starting services with docker-compose...$(NC)"
	docker-compose up -d

# Development setup
dev-setup: ## Set up development environment
	@echo "$(GREEN)Setting up development environment...$(NC)"
	@command -v golangci-lint >/dev/null 2>&1 || curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(shell go env GOPATH)/bin v1.54.2
	@command -v goimports >/dev/null 2>&1 || $(GOGET) golang.org/x/tools/cmd/goimports@latest
	@command -v gofumpt >/dev/null 2>&1 || $(GOGET) mvdan.cc/gofumpt@latest
	@command -v air >/dev/null 2>&1 || $(GOGET) github.com/cosmtrek/air@latest
	@command -v gosec >/dev/null 2>&1 || $(GOGET) github.com/securecodewarrior/gosec/v2/cmd/gosec@latest
	@command -v nancy >/dev/null 2>&1 || $(GOGET) github.com/sonatypecommunity/nancy@latest
	@command -v migrate >/dev/null 2>&1 || $(GOGET) -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
	@echo "$(GREEN)Development environment ready!$(NC)"

install-hooks: ## Install git hooks
	@echo "$(GREEN)Installing git hooks...$(NC)"
	cp scripts/hooks/pre-commit .git/hooks/
	chmod +x .git/hooks/pre-commit

# Cleanup targets
clean: ## Clean build artifacts and reports
	@echo "$(GREEN)Cleaning build artifacts...$(NC)"
	$(GOCLEAN)
	rm -rf $(BUILD_DIR)
	rm -f $(COVERAGE_FILE) $(COVERAGE_HTML)
	rm -f gosec-report.json
	rm -f deps.png

clean-deps: ## Clean dependency cache
	@echo "$(GREEN)Cleaning dependency cache...$(NC)"
	$(GOCMD) clean -modcache

# Release targets
release: clean lint test build ## Prepare release build

# Full CI pipeline (local-first approach)
ci: deps fmt vet lint test-coverage ## Run complete CI pipeline locally
	@echo ""
	@echo "$(GREEN)========================$(NC)"
	@echo "$(GREEN)✅ CI Pipeline Complete!$(NC)"
	@echo "$(GREEN)========================$(NC)"
	@echo ""
	@echo "Summary:"
	@echo "  ✅ Dependencies verified"
	@echo "  ✅ Code formatted"
	@echo "  ✅ Static analysis passed"
	@echo "  ✅ Linter passed (50+ checks)"
	@echo "  ✅ Tests passed with coverage"
	@echo ""
	@echo "$(GREEN)Ready to push!$(NC)"

# Quick local development check (< 10 seconds)
local: fmt vet test-short ## Quick local check before commit
	@echo "$(GREEN)✅ Local checks passed!$(NC)"

# Pre-push validation (matches pre-push hook)
pre-push: ## Validate before pushing (matches git pre-push hook)
	@echo "$(GREEN)Running pre-push validation...$(NC)"
	@$(GOTEST) -short ./...
	@echo "$(GREEN)✅ Pre-push validation passed!$(NC)"

# Performance profiling
profile-cpu: ## Run CPU profiling
	@echo "$(GREEN)Running CPU profiling...$(NC)"
	$(GOCMD) test -cpuprofile cpu.prof -bench . ./...
	$(GOCMD) tool pprof cpu.prof

profile-mem: ## Run memory profiling
	@echo "$(GREEN)Running memory profiling...$(NC)"
	$(GOCMD) test -memprofile mem.prof -bench . ./...
	$(GOCMD) tool pprof mem.prof