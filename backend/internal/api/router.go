package api

import (
	"choseby-backend/internal/auth"
	"choseby-backend/internal/config"
	"choseby-backend/internal/database"
	"choseby-backend/internal/handlers"
	"choseby-backend/internal/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter(db *database.DB, cfg *config.Config) *gin.Engine {
	router := gin.New()

	// Middleware
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// CORS for customer response platform frontend
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = cfg.CORSOrigins
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Request-ID"}
	corsConfig.ExposeHeaders = []string{"X-Request-ID", "X-Processing-Time"}
	router.Use(cors.New(corsConfig))

	// Security middleware
	router.Use(middleware.SecurityHeaders())
	router.Use(middleware.RequestID())
	router.Use(middleware.RateLimit(cfg.APIRateLimit, cfg.APIRateWindow))

	// Initialize services
	authService := auth.NewAuthService(
		cfg.JWTSecret,
		cfg.JWTExpiration,
		cfg.RefreshTokenExpiration,
	)

	// Initialize handlers for customer response workflows
	authHandler := handlers.NewAuthHandler(db, authService)
	decisionsHandler := handlers.NewDecisionsHandler(db, authService)
	evaluationsHandler := handlers.NewEvaluationsHandler(db, authService)
	aiHandler := handlers.NewAIHandler(db, authService, cfg.DeepSeekAPIKey)
	teamHandler := handlers.NewTeamHandler(db, authService)
	analyticsHandler := handlers.NewAnalyticsHandler(db, authService)
	healthHandler := handlers.NewHealthHandler(db)

	// Public routes
	public := router.Group("/api/v1")
	{
		// Health check for platform monitoring
		public.GET("/health", healthHandler.HealthCheck)
		public.HEAD("/health/ready", healthHandler.ReadinessProbe)

		// Authentication endpoints for customer response teams
		public.POST("/auth/register", authHandler.Register)
		public.POST("/auth/login", authHandler.Login)
	}

	// Protected routes - customer response platform
	protected := router.Group("/api/v1")
	protected.Use(middleware.AuthRequired(authService))
	{
		// Customer Decision Endpoints
		decisions := protected.Group("/decisions")
		{
			decisions.GET("", decisionsHandler.GetTeamDecisions)
			decisions.POST("", decisionsHandler.CreateDecision)
			decisions.GET("/:id", decisionsHandler.GetDecision)
			decisions.PUT("/:id", decisionsHandler.UpdateDecision)
			decisions.DELETE("/:id", decisionsHandler.DeleteDecision)

			// Decision criteria management
			decisions.PUT("/:id/criteria", decisionsHandler.UpdateCriteria)
			decisions.GET("/:id/criteria", decisionsHandler.GetCriteria)

			// Response options management
			decisions.PUT("/:id/options", decisionsHandler.UpdateOptions)
			decisions.GET("/:id/options", decisionsHandler.GetOptions)

			// Evaluation endpoints for anonymous team input
			decisions.POST("/:id/evaluate", evaluationsHandler.SubmitEvaluation)
			decisions.GET("/:id/results", evaluationsHandler.GetResults)
		}

		// AI Integration Endpoints for customer issue classification
		ai := protected.Group("/ai")
		{
			ai.POST("/classify", aiHandler.ClassifyIssue)
			ai.POST("/generate-options", aiHandler.GenerateOptions)
		}

		// Team Management Endpoints
		team := protected.Group("/team")
		{
			team.GET("/members", teamHandler.GetMembers)
			team.POST("/invite", teamHandler.InviteMember)
		}

		// Analytics Dashboard Endpoints
		analytics := protected.Group("/analytics")
		{
			analytics.GET("/dashboard", analyticsHandler.GetDashboard)
		}
	}

	return router
}
