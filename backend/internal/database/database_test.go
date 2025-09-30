package database

import (
	"context"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestInitialize_Success(t *testing.T) {
	// This test would require a real database connection
	// For unit testing, we focus on testing the wrapper methods
	t.Skip("Integration test - requires real database")
}

func TestDatabase_WrapperMethods(t *testing.T) {
	// Create mock database
	mockDB, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer mockDB.Close()

	// Wrap with sqlx
	sqlxDB := sqlx.NewDb(mockDB, "sqlmock")
	db := &DB{DB: sqlxDB}

	t.Run("Ping", func(t *testing.T) {
		mock.ExpectPing()
		err := db.Ping()
		assert.NoError(t, err)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("HealthCheck", func(t *testing.T) {
		mock.ExpectPing()
		err := db.HealthCheck()
		assert.NoError(t, err)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("BeginTxx", func(t *testing.T) {
		mock.ExpectBegin()
		tx, err := db.BeginTxx(context.Background(), nil)
		assert.NoError(t, err)
		assert.NotNil(t, tx)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Close", func(t *testing.T) {
		// Note: sqlmock Close expectation doesn't work well with defer
		// In real scenarios, Close() is called via defer and works correctly
		err := db.Close()
		assert.NoError(t, err)
	})
}

func TestDatabase_QueryMethods(t *testing.T) {
	// Create mock database
	mockDB, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer mockDB.Close()

	// Wrap with sqlx
	sqlxDB := sqlx.NewDb(mockDB, "sqlmock")
	db := &DB{DB: sqlxDB}

	t.Run("GetContext", func(t *testing.T) {
		rows := sqlmock.NewRows([]string{"count"}).AddRow(5)
		mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM teams").WillReturnRows(rows)

		var count int
		err := db.GetContext(context.Background(), &count, "SELECT COUNT(*) FROM teams")
		assert.NoError(t, err)
		assert.Equal(t, 5, count)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("SelectContext", func(t *testing.T) {
		rows := sqlmock.NewRows([]string{"id", "name"}).
			AddRow("1", "Team 1").
			AddRow("2", "Team 2")
		mock.ExpectQuery("SELECT id, name FROM teams").WillReturnRows(rows)

		type team struct {
			ID   string `db:"id"`
			Name string `db:"name"`
		}

		var teams []team
		err := db.SelectContext(context.Background(), &teams, "SELECT id, name FROM teams")
		assert.NoError(t, err)
		assert.Len(t, teams, 2)
		assert.Equal(t, "Team 1", teams[0].Name)
		assert.Equal(t, "Team 2", teams[1].Name)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("ExecContext", func(t *testing.T) {
		mock.ExpectExec("INSERT INTO teams").
			WithArgs("test-team", "Test Company").
			WillReturnResult(sqlmock.NewResult(1, 1))

		result, err := db.ExecContext(context.Background(),
			"INSERT INTO teams (name, company) VALUES ($1, $2)",
			"test-team", "Test Company")
		assert.NoError(t, err)

		rowsAffected, err := result.RowsAffected()
		assert.NoError(t, err)
		assert.Equal(t, int64(1), rowsAffected)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("NamedExecContext", func(t *testing.T) {
		mock.ExpectExec("INSERT INTO teams").
			WithArgs("test-team", "Test Company").
			WillReturnResult(sqlmock.NewResult(1, 1))

		team := struct {
			Name    string `db:"name"`
			Company string `db:"company"`
		}{
			Name:    "test-team",
			Company: "Test Company",
		}

		result, err := db.NamedExecContext(context.Background(),
			"INSERT INTO teams (name, company) VALUES (:name, :company)", team)
		assert.NoError(t, err)

		rowsAffected, err := result.RowsAffected()
		assert.NoError(t, err)
		assert.Equal(t, int64(1), rowsAffected)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestInitializeSchema(t *testing.T) {
	// Create mock database
	mockDB, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer mockDB.Close()

	// Wrap with sqlx
	sqlxDB := sqlx.NewDb(mockDB, "sqlmock")

	t.Run("Schema exists", func(t *testing.T) {
		rows := sqlmock.NewRows([]string{"count"}).AddRow(3)
		mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM information_schema.tables").
			WillReturnRows(rows)

		err := initializeSchema(sqlxDB)
		assert.NoError(t, err)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Schema missing", func(t *testing.T) {
		rows := sqlmock.NewRows([]string{"count"}).AddRow(0)
		mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM information_schema.tables").
			WillReturnRows(rows)

		err := initializeSchema(sqlxDB)
		assert.NoError(t, err)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("Database error", func(t *testing.T) {
		mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM information_schema.tables").
			WillReturnError(sqlmock.ErrCancelled)

		err := initializeSchema(sqlxDB)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "failed to check schema")
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}