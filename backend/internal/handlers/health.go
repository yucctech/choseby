package handlers

import (
	"net/http"
	"time"

	"choseby-backend/internal/database"

	"github.com/gin-gonic/gin"
)

// HealthHandler handles health check endpoints for monitoring
type HealthHandler struct {
	db *database.DB
}

func NewHealthHandler(db *database.DB) *HealthHandler {
	return &HealthHandler{
		db: db,
	}
}

// HealthCheck provides comprehensive health status for the customer response platform
func (h *HealthHandler) HealthCheck(c *gin.Context) {
	status := gin.H{
		"status":    "ok",
		"timestamp": time.Now().UTC(),
		"service":   "Choseby Customer Response Decision Intelligence API",
		"version":   "1.0.0",
	}

	// Check database connectivity
	if h.db != nil {
		if err := h.db.Ping(); err != nil {
			status["status"] = "degraded"
			status["database"] = "disconnected"
			status["error"] = err.Error()
			c.JSON(http.StatusServiceUnavailable, status)
			return
		}
		status["database"] = "connected"

		// Check if core tables exist
		var tableCount int
		err := h.db.GetContext(c, &tableCount, `
			SELECT COUNT(*) FROM information_schema.tables
			WHERE table_schema = 'public'
			AND table_name IN ('teams', 'team_members', 'customer_decisions', 'evaluations')
		`)
		if err != nil || tableCount < 4 {
			status["status"] = "degraded"
			status["schema"] = "incomplete"
		} else {
			status["schema"] = "ready"
		}
	} else {
		status["status"] = "degraded"
		status["database"] = "not_configured"
	}

	// Determine HTTP status based on health
	httpStatus := http.StatusOK
	if status["status"] == "degraded" {
		httpStatus = http.StatusServiceUnavailable
	}

	c.JSON(httpStatus, status)
}

// ReadinessProbe provides a simple readiness check for load balancers
func (h *HealthHandler) ReadinessProbe(c *gin.Context) {
	if h.db != nil && h.db.Ping() == nil {
		c.Status(http.StatusOK)
	} else {
		c.Status(http.StatusServiceUnavailable)
	}
}