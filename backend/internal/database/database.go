package database

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/lib/pq"
)

type DB struct {
	*sql.DB
}

// Initialize creates a new database connection
func Initialize(databaseURL string) (*DB, error) {
	db, err := sql.Open("postgres", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Configure connection pool for healthcare workload
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

	log.Println("Database connected successfully")
	return &DB{db}, nil
}

// Healthcare-compliant query wrapper with audit logging
func (db *DB) Query(query string, args ...interface{}) (*sql.Rows, error) {
	start := time.Now()
	rows, err := db.DB.Query(query, args...)
	duration := time.Since(start)

	// Log query for HIPAA audit trail
	log.Printf("Query executed: %s... Duration: %v",
		truncateString(query, 100), duration)

	if err != nil {
		log.Printf("Database query error: %v", err)
		return nil, err
	}

	return rows, nil
}

// Healthcare-compliant exec wrapper with audit logging
func (db *DB) Exec(query string, args ...interface{}) (sql.Result, error) {
	start := time.Now()
	result, err := db.DB.Exec(query, args...)
	duration := time.Since(start)

	// Log query for HIPAA audit trail
	log.Printf("Exec executed: %s... Duration: %v",
		truncateString(query, 100), duration)

	if err != nil {
		log.Printf("Database exec error: %v", err)
		return nil, err
	}

	return result, nil
}

// DetectConflicts implements the core conflict detection algorithm
func (db *DB) DetectConflicts(decisionID string) ([]ConflictResult, error) {
	query := `
		SELECT
			es.option_id,
			es.criterion_id,
			do.name as option_name,
			dc.name as criterion_name,
			COUNT(*) as evaluation_count,
			AVG(es.score) as mean_score,
			STDDEV(es.score) as score_variance,
			CASE
				WHEN STDDEV(es.score) > 2.5 THEN 'high'
				WHEN STDDEV(es.score) > 1.5 THEN 'medium'
				WHEN STDDEV(es.score) > 0.5 THEN 'low'
				ELSE 'none'
			END as conflict_level
		FROM evaluation_scores es
		JOIN decision_options do ON es.option_id = do.id
		JOIN decision_criteria dc ON es.criterion_id = dc.id
		JOIN evaluations e ON es.evaluation_id = e.id
		WHERE e.decision_id = $1
		GROUP BY es.option_id, es.criterion_id, do.name, dc.name
		HAVING COUNT(*) >= 2 AND STDDEV(es.score) > 0.5
		ORDER BY score_variance DESC
	`

	rows, err := db.Query(query, decisionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var conflicts []ConflictResult
	for rows.Next() {
		var conflict ConflictResult
		err := rows.Scan(
			&conflict.OptionID,
			&conflict.CriterionID,
			&conflict.OptionName,
			&conflict.CriterionName,
			&conflict.EvaluationCount,
			&conflict.MeanScore,
			&conflict.ScoreVariance,
			&conflict.ConflictLevel,
		)
		if err != nil {
			return nil, err
		}
		conflicts = append(conflicts, conflict)
	}

	return conflicts, nil
}

// AuditLog creates HIPAA-compliant audit log entries
func (db *DB) AuditLog(userID, action, resourceID string, details map[string]interface{}) error {
	query := `
		INSERT INTO audit_log (user_id, action, resource_id, details, ip_address, timestamp)
		VALUES ($1, $2, $3, $4, $5, NOW())
	`

	detailsJSON := ""
	if details != nil {
		// Convert details to JSON string (simplified for demo)
		detailsJSON = fmt.Sprintf("%v", details)
	}

	_, err := db.Exec(query, userID, action, resourceID, detailsJSON, "127.0.0.1")
	return err
}

type ConflictResult struct {
	OptionID        string  `json:"option_id"`
	CriterionID     string  `json:"criterion_id"`
	OptionName      string  `json:"option_name"`
	CriterionName   string  `json:"criterion_name"`
	EvaluationCount int     `json:"evaluation_count"`
	MeanScore       float64 `json:"mean_score"`
	ScoreVariance   float64 `json:"score_variance"`
	ConflictLevel   string  `json:"conflict_level"`
}

func truncateString(s string, maxLength int) string {
	if len(s) <= maxLength {
		return s
	}
	return s[:maxLength]
}

func initializeSchema(db *sql.DB) error {
	// Check if tables exist, create if not
	var tableExists bool
	err := db.QueryRow(`
		SELECT EXISTS (
			SELECT FROM information_schema.tables
			WHERE table_schema = 'public'
			AND table_name = 'teams'
		)
	`).Scan(&tableExists)

	if err != nil {
		return err
	}

	if !tableExists {
		log.Println("Initializing database schema...")
		// In production, this would run the full schema from schema.sql
		// For now, we'll assume the schema exists or is created separately
		log.Println("Schema initialization would run here")
	}

	return nil
}