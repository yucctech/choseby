# Choseby Customer Response Decision Intelligence - Development Makefile

.PHONY: test test-verbose test-coverage test-race build clean lint fmt vet run deps help

# Default target
help:
	@echo "Available targets:"
	@echo "  test         - Run all tests"
	@echo "  test-verbose - Run tests with verbose output"
	@echo "  test-coverage- Run tests with coverage report"
	@echo "  test-race    - Run tests with race detection"
	@echo "  build        - Build the application"
	@echo "  clean        - Clean build artifacts"
	@echo "  lint         - Run golangci-lint (requires installation)"
	@echo "  fmt          - Format code"
	@echo "  vet          - Run go vet"
	@echo "  run          - Run the application"
	@echo "  deps         - Download dependencies"

# Test targets
test:
	@echo "Running tests..."
	go test ./... -short

test-verbose:
	@echo "Running tests with verbose output..."
	go test ./... -v -short

test-coverage:
	@echo "Running tests with coverage..."
	go test ./... -short -coverprofile=coverage.out
	go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"

test-race:
	@echo "Running tests with race detection..."
	go test ./... -short -race

# Build targets
build:
	@echo "Building application..."
	go build -o bin/choseby-api main.go

clean:
	@echo "Cleaning build artifacts..."
	rm -rf bin/
	rm -f coverage.out coverage.html

# Code quality targets
fmt:
	@echo "Formatting code..."
	go fmt ./...

vet:
	@echo "Running go vet..."
	go vet ./...

lint:
	@echo "Running golangci-lint..."
	golangci-lint run

# Development targets
run:
	@echo "Starting development server..."
	go run main.go

deps:
	@echo "Downloading dependencies..."
	go mod download
	go mod tidy

# Integration test target (requires database)
test-integration:
	@echo "Running integration tests..."
	go test ./... -tags=integration

# Docker targets
docker-build:
	@echo "Building Docker image..."
	docker build -t choseby-api .

docker-run:
	@echo "Running Docker container..."
	docker run -p 8080:8080 choseby-api

# Database targets
db-setup:
	@echo "Setting up database schema..."
	psql $(DATABASE_URL) -f database/schema.sql

db-reset:
	@echo "Resetting database..."
	psql $(DATABASE_URL) -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
	make db-setup