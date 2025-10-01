package database

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

type DB struct {
	*sqlx.DB
}

// Initialize creates a new database connection with sqlx
func Initialize(databaseURL string) (*DB, error) {
	db, err := sqlx.Connect("postgres", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configure connection pool for customer response platform
	db.SetMaxOpenConns(20)
	db.SetMaxIdleConns(10)
	db.SetConnMaxLifetime(time.Hour)

	// Test the connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Initialize database schema if needed
	if err := initializeSchema(db); err != nil {
		return nil, fmt.Errorf("failed to initialize schema: %w", err)
	}

	log.Println("Customer Response Database connected successfully")
	return &DB{db}, nil
}

// initializeSchema creates database schema if it doesn't exist
func initializeSchema(db *sqlx.DB) error {
	// Check if core tables exist
	var tableCount int
	err := db.Get(&tableCount, `
		SELECT COUNT(*) FROM information_schema.tables
		WHERE table_schema = 'public'
		AND table_name IN ('teams', 'team_members', 'customer_decisions')
	`)
	if err != nil {
		return fmt.Errorf("failed to check schema: %w", err)
	}

	if tableCount == 0 {
		log.Println("Database schema not found. Please run the schema.sql file to initialize the database.")
		// In a production setup, you might want to run the schema automatically
		// For now, we'll just log the message
	} else {
		log.Printf("Database schema verified - %d core tables found", tableCount)
	}

	return nil
}

// BeginTxx starts a transaction with context
func (db *DB) BeginTxx(ctx context.Context, opts *sql.TxOptions) (*sqlx.Tx, error) {
	return db.DB.BeginTxx(ctx, opts)
}

// Close closes the database connection
func (db *DB) Close() error {
	return db.DB.Close()
}

// Ping verifies the database connection
func (db *DB) Ping() error {
	return db.DB.Ping()
}

// Health check for database
func (db *DB) HealthCheck() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	return db.PingContext(ctx)
}
