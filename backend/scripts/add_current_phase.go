package scripts

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func AddCurrentPhase() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgresql://postgres.igrmbkienznttmunapix:9C.2@eVGaVLWAse@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require&search_path=public"
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	query := `
		ALTER TABLE decisions
		ADD COLUMN IF NOT EXISTS current_phase INTEGER DEFAULT 1
		CHECK (current_phase >= 1 AND current_phase <= 6);
	`

	_, err = db.Exec(query)
	if err != nil {
		log.Fatal("Failed to add current_phase column:", err)
	}

	fmt.Println("✅ Successfully added current_phase column to decisions table")
}
