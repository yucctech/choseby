package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {
	log.Println("=== Choseby Healthcare API Starting ===")

	// Log environment info
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
		log.Println("PORT not set, using default 8080")
	} else {
		log.Printf("PORT from environment: %s", port)
	}

	// Set Gin to release mode for production
	gin.SetMode(gin.ReleaseMode)
	log.Println("Gin set to release mode")

	// Create Gin router
	router := gin.Default()
	log.Println("Gin router created")

	// Add basic health check endpoint
	router.GET("/health", func(c *gin.Context) {
		log.Println("Health check endpoint hit")
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "choseby-healthcare-api",
			"version": "1.0.0",
			"port":    port,
		})
	})

	// Add basic API endpoint
	router.GET("/api/v1/health", func(c *gin.Context) {
		log.Println("API health check endpoint hit")
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "choseby-healthcare-api",
			"version": "1.0.0",
			"port":    port,
		})
	})

	// Add root endpoint
	router.GET("/", func(c *gin.Context) {
		log.Println("Root endpoint hit")
		c.JSON(http.StatusOK, gin.H{
			"message": "Choseby Healthcare Team Decision Platform API",
			"status":  "running",
			"version": "1.0.0",
		})
	})

	log.Printf("=== Starting server on 0.0.0.0:%s ===", port)

	// Start server
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}