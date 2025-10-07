package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/google/uuid"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	// Get database URL from environment
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	// Connect to database
	db, err := sql.Open("postgres", databaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Test connection
	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	fmt.Println("✓ Connected to database")

	// Generate bcrypt hash for "demo123"
	passwordHash, err := bcrypt.GenerateFromPassword([]byte("demo123"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to generate password hash: %v", err)
	}

	fmt.Println("✓ Generated password hash for demo123")

	// Start transaction
	tx, err := db.Begin()
	if err != nil {
		log.Fatalf("Failed to start transaction: %v", err)
	}
	defer tx.Rollback()

	// Create demo team
	teamID := uuid.MustParse("00000000-0000-0000-0000-000000000001")
	_, err = tx.Exec(`
		INSERT INTO teams (id, name, company_name, team_size, subscription_tier, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		ON CONFLICT (id) DO UPDATE SET
			name = EXCLUDED.name,
			updated_at = EXCLUDED.updated_at
	`, teamID, "Demo Team", "Demo Company", 1, "starter", time.Now(), time.Now())
	if err != nil {
		log.Fatalf("Failed to create demo team: %v", err)
	}

	fmt.Println("✓ Created demo team")

	// Create demo user
	userID := uuid.MustParse("00000000-0000-0000-0000-000000000002")
	_, err = tx.Exec(`
		INSERT INTO team_members (
			id, team_id, email, name, password_hash, role, escalation_authority,
			notification_preferences, is_active, created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		ON CONFLICT (email) DO UPDATE SET
			password_hash = EXCLUDED.password_hash,
			updated_at = EXCLUDED.updated_at
	`,
		userID,
		teamID,
		"demo@choseby.com",
		"Demo User",
		string(passwordHash),
		"customer_success_manager",
		5,
		`{"email": true, "sms": false, "push": true}`,
		true,
		time.Now(),
		time.Now(),
	)
	if err != nil {
		log.Fatalf("Failed to create demo user: %v", err)
	}

	fmt.Println("✓ Created demo user: demo@choseby.com")

	// Commit transaction
	if err := tx.Commit(); err != nil {
		log.Fatalf("Failed to commit transaction: %v", err)
	}

	fmt.Println("\n✅ Demo user seeded successfully!")
	fmt.Println("   Email: demo@choseby.com")
	fmt.Println("   Password: demo123")
	fmt.Println("   Team: Demo Team")
	fmt.Println("   Role: Customer Success Manager")
}
