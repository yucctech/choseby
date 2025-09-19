#!/bin/bash
set -e

echo "Starting Go build process..."

# Clean any existing go.sum that might be corrupted
rm -f go.sum

# Download dependencies and generate go.sum
echo "Running go mod download..."
go mod download

# Tidy up modules
echo "Running go mod tidy..."
go mod tidy

# Verify modules
echo "Running go mod verify..."
go mod verify

# Build the application
echo "Building application..."
go build -o main .

echo "Build completed successfully!"