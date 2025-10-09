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
		log.Fatal("Usage: go run cmd/check_evaluations.go <decision_id>")
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

	type EvalCount struct {
		DecisionID  string `db:"decision_id"`
		OptionID    string `db:"option_id"`
		EvaluatorID string `db:"evaluator_id"`
		EvalCount   int    `db:"eval_count"`
	}

	var counts []EvalCount
	err = db.Select(&counts, `
		SELECT decision_id, option_id, evaluator_id, COUNT(*) as eval_count
		FROM evaluations
		WHERE decision_id = $1
		GROUP BY decision_id, option_id, evaluator_id
		ORDER BY option_id, evaluator_id
	`, decisionID)
	if err != nil {
		log.Fatalf("Query failed: %v", err)
	}

	fmt.Println("Evaluations per option per evaluator:")
	for _, c := range counts {
		fmt.Printf("Option: %s, Evaluator: %s, Count: %d\n", c.OptionID[:8], c.EvaluatorID[:8], c.EvalCount)
	}

	var totalCount int
	err = db.Get(&totalCount, `SELECT COUNT(*) FROM evaluations WHERE decision_id = $1`, decisionID)
	if err != nil {
		log.Fatalf("Total count failed: %v", err)
	}
	fmt.Printf("\nTotal evaluations: %d\n", totalCount)

	var uniqueEvaluators int
	err = db.Get(&uniqueEvaluators, `
		SELECT COUNT(DISTINCT evaluator_id) FROM evaluations WHERE decision_id = $1
	`, decisionID)
	if err != nil {
		log.Fatalf("Unique evaluators failed: %v", err)
	}
	fmt.Printf("Unique evaluators: %d\n", uniqueEvaluators)
}
