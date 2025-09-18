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

	// CORS for healthcare frontend
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

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(db, authService)
	teamHandler := handlers.NewTeamHandler(db, authService)
	decisionHandler := handlers.NewDecisionHandler(db, authService)
	evaluationHandler := handlers.NewEvaluationHandler(db, authService)
	conflictHandler := handlers.NewConflictHandler(db, authService)
	complianceHandler := handlers.NewComplianceHandler(db, authService)
	healthHandler := handlers.NewHealthHandler(db)

	// Public routes
	public := router.Group("/api/v1")
	{
		// Health check
		public.GET("/health", healthHandler.HealthCheck)
		public.HEAD("/health/ready", healthHandler.ReadinessProbe)

		// Authentication
		public.POST("/auth/login", authHandler.Login)
		public.POST("/auth/refresh", authHandler.RefreshToken)
		public.POST("/auth/sso/epic", authHandler.EpicSSO)
		public.POST("/auth/sso/cerner", authHandler.CernerSSO)
	}

	// Protected routes
	protected := router.Group("/api/v1")
	protected.Use(middleware.AuthRequired(authService))
	{
		// User management
		protected.GET("/user/profile", authHandler.GetProfile)
		protected.PUT("/user/profile", authHandler.UpdateProfile)
		protected.POST("/auth/logout", authHandler.Logout)

		// Team management
		teams := protected.Group("/teams")
		{
			teams.GET("", teamHandler.GetUserTeams)
			teams.POST("", teamHandler.CreateTeam)
			teams.GET("/:teamId", middleware.TeamMember(), teamHandler.GetTeam)
			teams.PUT("/:teamId", middleware.TeamAdmin(), teamHandler.UpdateTeam)
			teams.DELETE("/:teamId", middleware.TeamAdmin(), teamHandler.DeleteTeam)

			// Team members
			teams.GET("/:teamId/members", middleware.TeamMember(), teamHandler.GetTeamMembers)
			teams.POST("/:teamId/members", middleware.TeamAdmin(), teamHandler.AddTeamMember)
			teams.PUT("/:teamId/members/:userId", middleware.TeamAdmin(), teamHandler.UpdateTeamMember)
			teams.DELETE("/:teamId/members/:userId", middleware.TeamAdmin(), teamHandler.RemoveTeamMember)

			// Decisions
			decisions := teams.Group("/:teamId/decisions")
			decisions.Use(middleware.TeamMember())
			{
				decisions.GET("", decisionHandler.GetTeamDecisions)
				decisions.POST("", decisionHandler.CreateDecision)
				decisions.GET("/:decisionId", decisionHandler.GetDecision)
				decisions.PUT("/:decisionId", decisionHandler.UpdateDecision)
				decisions.DELETE("/:decisionId", decisionHandler.DeleteDecision)

				// Decision criteria
				decisions.GET("/:decisionId/criteria", decisionHandler.GetDecisionCriteria)
				decisions.POST("/:decisionId/criteria", decisionHandler.CreateCriterion)
				decisions.PUT("/:decisionId/criteria/:criterionId", decisionHandler.UpdateCriterion)
				decisions.DELETE("/:decisionId/criteria/:criterionId", decisionHandler.DeleteCriterion)

				// Decision options
				decisions.GET("/:decisionId/options", decisionHandler.GetDecisionOptions)
				decisions.POST("/:decisionId/options", decisionHandler.CreateOption)
				decisions.PUT("/:decisionId/options/:optionId", decisionHandler.UpdateOption)
				decisions.DELETE("/:decisionId/options/:optionId", decisionHandler.DeleteOption)

				// Anonymous evaluations
				evaluations := decisions.Group("/:decisionId/evaluations")
				{
					evaluations.GET("", evaluationHandler.GetEvaluationStatus)
					evaluations.POST("", evaluationHandler.SubmitEvaluation)
					evaluations.GET("/summary", evaluationHandler.GetEvaluationSummary)
					evaluations.GET("/export", evaluationHandler.ExportEvaluations)
				}

				// Conflict resolution
				conflicts := decisions.Group("/:decisionId/conflicts")
				{
					conflicts.GET("", conflictHandler.GetConflicts)
					conflicts.POST("", conflictHandler.InitiateResolution)
					conflicts.GET("/:conflictId", conflictHandler.GetConflictDetails)
					conflicts.PUT("/:conflictId/resolve", conflictHandler.ResolveConflict)
				}
			}
		}

		// Healthcare compliance
		compliance := protected.Group("/compliance")
		compliance.Use(middleware.Permission("view_analytics"))
		{
			compliance.GET("/audit", complianceHandler.GetAuditReport)
			compliance.POST("/audit/cleanup", complianceHandler.PerformRetentionCleanup)
			compliance.GET("/health", complianceHandler.GetComplianceHealth)
		}
	}

	// WebSocket endpoint for real-time collaboration
	router.GET("/ws/:teamId", middleware.WebSocketAuth(authService), handlers.HandleWebSocket)

	return router
}