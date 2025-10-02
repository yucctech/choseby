#!/bin/bash
# Load environment variables from .env file
export DATABASE_URL="postgresql://postgres.igrmbkienznttmunapix:9C.2%40eVGaVLWAse@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require&search_path=public"
export JWT_SECRET="cd457b87838ee5a449facb393130752e3e1f93d638053387fc91b3da565e853a"

echo "DATABASE_URL set: ${DATABASE_URL:0:50}..."

# Run integration tests
go test -v -timeout 10m -tags=integration ./...
