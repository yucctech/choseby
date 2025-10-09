package main

import (
	"fmt"
	"log"
	"os"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func main() {
	if len(os.Args) < 2 {
		log.Fatal("Usage: go run cmd/check_decision_details.go <decision_id>")
	}

	decisionID := os.Args[1]
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL not set")
	}

	db, err := sqlx.Connect("postgres", dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Check decision
	type Decision struct {
		ID    string `db:"id"`
		Title string `db:"title"`
	}
	var decision Decision
	err = db.Get(&decision, `SELECT id, title FROM customer_decisions WHERE id = $1`, decisionID)
	if err != nil {
		log.Fatalf("Decision not found: %v", err)
	}
	fmt.Printf("✅ Decision: %s\n", decision.Title)

	// Check criteria
	var criteriaCount int
	err = db.Get(&criteriaCount, `SELECT COUNT(*) FROM decision_criteria WHERE decision_id = $1`, decisionID)
	if err != nil {
		log.Fatalf("Failed to count criteria: %v", err)
	}
	fmt.Printf("   Criteria: %d\n", criteriaCount)

	// Check options
	var optionsCount int
	err = db.Get(&optionsCount, `SELECT COUNT(*) FROM response_options WHERE decision_id = $1`, decisionID)
	if err != nil {
		log.Fatalf("Failed to count options: %v", err)
	}
	fmt.Printf("   Options: %d\n", optionsCount)

	// Check evaluations
	var evalsCount int
	err = db.Get(&evalsCount, `SELECT COUNT(*) FROM evaluations WHERE decision_id = $1`, decisionID)
	if err != nil {
		evalsCount = 0
	}
	fmt.Printf("   Evaluations: %d\n", evalsCount)

	if criteriaCount == 0 || optionsCount == 0 {
		fmt.Println("\n❌ PROBLEM: Missing criteria or options - evaluations can't be submitted!")
	}
}
