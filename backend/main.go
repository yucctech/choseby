package main

import (
	"log"
	"os"

	"choseby-backend/internal/api"
	"choseby-backend/internal/config"
	"choseby-backend/internal/database"
	"github.com/gin-gonic/gin"
)

func main() {
	log.Println("=== Choseby Customer Response Decision Intelligence API Starting ===")

	// Load configuration
	cfg := config.Load()
	log.Printf("Configuration loaded for environment: %s", cfg.Environment)

	// Initialize database
	db, err := database.Initialize(cfg.DatabaseURL)
	if err != nil {
		log.Printf("Warning: Database connection failed: %v", err)
		log.Println("Continuing without database for now...")
		db = nil
	} else {
		log.Println("Database connection successful")
		defer db.Close()
	}

	// Set Gin mode
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
		log.Println("Gin set to release mode")
	} else {
		log.Println("Gin set to debug mode")
	}

	// Initialize router with full API
	router := api.SetupRouter(db, cfg)
	log.Println("Full API router initialized")

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = cfg.Port
	}

	log.Printf("=== Starting Choseby Customer Response Decision Intelligence API server on port %s ===", port)
	log.Printf("Environment: %s", cfg.Environment)
	if db != nil {
		log.Printf("Database: Connected to PostgreSQL")
	} else {
		log.Printf("Database: Running without database connection")
	}
	log.Printf("AI Integration: DeepSeek API %s", func() string {
		if cfg.DeepSeekAPIKey != "" {
			return "enabled"
		}
		return "disabled"
	}())

	// Start server
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
