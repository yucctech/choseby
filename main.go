package main

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {
	// Simple test server
	router := gin.Default()

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "healthy",
			"service": "choseby-backend",
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	router.Run(":" + port)
}