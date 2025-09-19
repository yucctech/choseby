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
	// Load environment variables - skip in production as Render provides them
	// godotenv is not needed for Render deployment

	// Load configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.Initialize(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	// Set Gin mode
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize router
	router := api.SetupRouter(db, cfg)

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting Choseby Healthcare Decision Platform API server on port %s", port)
	log.Printf("Environment: %s", cfg.Environment)
	log.Printf("Database: Connected to PostgreSQL")

	// Start server
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}