package handlers

import (
	"net/http"
	"strconv"
	"time"

	"choseby-backend/internal/auth"
	"choseby-backend/internal/database"
	"choseby-backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// AnalyticsHandler handles customer response analytics and dashboard data
type AnalyticsHandler struct {
	db          *database.DB
	authService *auth.Service
}

func NewAnalyticsHandler(db *database.DB, authService *auth.Service) *AnalyticsHandler {
	return &AnalyticsHandler{
		db:          db,
		authService: authService,
	}
}

// GetDashboard returns comprehensive dashboard analytics for customer response teams
func (h *AnalyticsHandler) GetDashboard(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get query parameters
	period := c.DefaultQuery("period", "30d")

	// Get user's team ID
	var teamID uuid.UUID
	err := h.db.GetContext(c, &teamID, `
		SELECT team_id FROM team_members WHERE id = $1 AND is_active = true
	`, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		return
	}

	// Calculate date range based on period
	startDate, period := h.calculateDateRange(period)

	// Get total decisions in period
	var totalDecisions int
	err = h.db.GetContext(c, &totalDecisions, `
		SELECT COUNT(*) FROM customer_decisions
		WHERE team_id = $1 AND created_at >= $2
	`, teamID, startDate)
	if err != nil {
		totalDecisions = 0
	}

	// Calculate average resolution time from outcome_tracking
	var avgResolutionHours float64
	err = h.db.GetContext(c, &avgResolutionHours, `
		SELECT COALESCE(AVG(ot.time_to_resolution_hours), 0)
		FROM outcome_tracking ot
		JOIN customer_decisions cd ON ot.decision_id = cd.id
		WHERE cd.team_id = $1
		AND cd.created_at >= $2
		AND ot.time_to_resolution_hours IS NOT NULL
	`, teamID, startDate)
	if err != nil {
		avgResolutionHours = 0
	}

	// Calculate average customer satisfaction from outcome_tracking
	var avgCustomerSatisfaction float64
	err = h.db.GetContext(c, &avgCustomerSatisfaction, `
		SELECT COALESCE(AVG(ot.customer_satisfaction_score::float), 0)
		FROM outcome_tracking ot
		JOIN customer_decisions cd ON ot.decision_id = cd.id
		WHERE cd.team_id = $1
		AND cd.created_at >= $2
		AND ot.customer_satisfaction_score IS NOT NULL
	`, teamID, startDate)
	if err != nil {
		avgCustomerSatisfaction = 0
	}

	// Get decision types breakdown
	type DecisionTypeCount struct {
		DecisionType string `db:"decision_type"`
		Count        int    `db:"count"`
	}

	var decisionTypes []DecisionTypeCount
	err = h.db.SelectContext(c, &decisionTypes, `
		SELECT decision_type, COUNT(*) as count
		FROM customer_decisions
		WHERE team_id = $1 AND created_at >= $2
		GROUP BY decision_type
		ORDER BY count DESC
	`, teamID, startDate)
	if err != nil {
		decisionTypes = []DecisionTypeCount{}
	}

	// Convert to map for response
	decisionTypesMap := make(map[string]int)
	for _, dt := range decisionTypes {
		decisionTypesMap[dt.DecisionType] = dt.Count
	}

	// Get urgency breakdown
	type UrgencyCount struct {
		UrgencyLevel int `db:"urgency_level"`
		Count        int `db:"count"`
	}

	var urgencyBreakdown []UrgencyCount
	err = h.db.SelectContext(c, &urgencyBreakdown, `
		SELECT urgency_level, COUNT(*) as count
		FROM customer_decisions
		WHERE team_id = $1 AND created_at >= $2
		GROUP BY urgency_level
		ORDER BY urgency_level
	`, teamID, startDate)
	if err != nil {
		urgencyBreakdown = []UrgencyCount{}
	}

	// Convert to map for response
	urgencyBreakdownMap := make(map[string]int)
	for _, ub := range urgencyBreakdown {
		urgencyBreakdownMap[strconv.Itoa(ub.UrgencyLevel)] = ub.Count
	}

	// Get recent activity (last 10 decisions)
	type RecentActivity struct {
		ID           uuid.UUID `json:"id" db:"id"`
		CustomerName string    `json:"customer_name" db:"customer_name"`
		Title        string    `json:"title" db:"title"`
		Status       string    `json:"status" db:"status"`
		UrgencyLevel int       `json:"urgency_level" db:"urgency_level"`
		CreatedAt    time.Time `json:"created_at" db:"created_at"`
	}

	var recentActivity []RecentActivity
	err = h.db.SelectContext(c, &recentActivity, `
		SELECT id, customer_name, title, status, urgency_level, created_at
		FROM customer_decisions
		WHERE team_id = $1
		ORDER BY created_at DESC
		LIMIT 10
	`, teamID)
	if err != nil {
		recentActivity = []RecentActivity{}
	}

	// Get performance trends (weekly data for the period)
	type WeeklyTrend struct {
		Week              string  `json:"week" db:"week"`
		DecisionCount     int     `json:"decision_count" db:"decision_count"`
		AvgResolutionTime float64 `json:"avg_resolution_time" db:"avg_resolution_time"`
		AvgSatisfaction   float64 `json:"avg_satisfaction" db:"avg_satisfaction"`
	}

	var weeklyTrends []WeeklyTrend
	err = h.db.SelectContext(c, &weeklyTrends, `
		SELECT
			DATE_TRUNC('week', cd.created_at)::date as week,
			COUNT(cd.id) as decision_count,
			COALESCE(AVG(ot.time_to_resolution_hours), 0) as avg_resolution_time,
			COALESCE(AVG(ot.customer_satisfaction_score::float), 0) as avg_satisfaction
		FROM customer_decisions cd
		LEFT JOIN outcome_tracking ot ON cd.id = ot.decision_id
		WHERE cd.team_id = $1 AND cd.created_at >= $2
		GROUP BY DATE_TRUNC('week', cd.created_at)
		ORDER BY week DESC
	`, teamID, startDate)
	if err != nil {
		weeklyTrends = []WeeklyTrend{}
	}

	// Get top customer tiers by volume
	type CustomerTierStats struct {
		Tier  string `json:"tier" db:"tier"`
		Count int    `json:"count" db:"count"`
	}

	var customerTiers []CustomerTierStats
	err = h.db.SelectContext(c, &customerTiers, `
		SELECT customer_tier as tier, COUNT(*) as count
		FROM customer_decisions
		WHERE team_id = $1 AND created_at >= $2
		GROUP BY customer_tier
		ORDER BY count DESC
	`, teamID, startDate)
	if err != nil {
		customerTiers = []CustomerTierStats{}
	}

	// Calculate team efficiency metrics
	teamEfficiency := h.calculateTeamEfficiency(c, teamID, startDate)

	// Build final analytics response
	analytics := models.DashboardAnalytics{
		Period:                     period,
		TotalDecisions:             totalDecisions,
		AverageResolutionTimeHours: avgResolutionHours,
		CustomerSatisfactionAvg:    avgCustomerSatisfaction,
		DecisionTypes:              decisionTypesMap,
		UrgencyBreakdown:           urgencyBreakdownMap,
	}

	// Extended analytics response with additional metrics
	response := gin.H{
		"analytics":       analytics,
		"recent_activity": recentActivity,
		"weekly_trends":   weeklyTrends,
		"customer_tiers":  customerTiers,
		"team_efficiency": teamEfficiency,
		"summary": gin.H{
			"total_decisions":      totalDecisions,
			"avg_resolution_hours": avgResolutionHours,
			"avg_satisfaction":     avgCustomerSatisfaction,
			"participation_rate":   teamEfficiency["participation_rate"],
		},
	}

	c.JSON(http.StatusOK, response)
}

// GetTeamPerformance returns detailed team performance metrics (placeholder)
func (h *AnalyticsHandler) GetTeamPerformance(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get user's team ID
	var teamID uuid.UUID
	err := h.db.GetContext(c, &teamID, `
		SELECT team_id FROM team_members WHERE id = $1 AND is_active = true
	`, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		return
	}

	// Individual team member performance
	type MemberPerformance struct {
		MemberID          uuid.UUID `json:"member_id" db:"member_id"`
		Name              string    `json:"name" db:"name"`
		Role              string    `json:"role" db:"role"`
		EvaluationsCount  int       `json:"evaluations_count" db:"evaluations_count"`
		AvgResponseTime   float64   `json:"avg_response_time" db:"avg_response_time"`
		ParticipationRate float64   `json:"participation_rate" db:"participation_rate"`
	}

	var memberPerformance []MemberPerformance
	err = h.db.SelectContext(c, &memberPerformance, `
		SELECT
			tm.id as member_id,
			tm.name,
			tm.role,
			COUNT(e.id) as evaluations_count,
			COALESCE(AVG(EXTRACT(EPOCH FROM (e.created_at - cd.created_at)) / 3600), 0) as avg_response_time,
			(COUNT(e.id)::float / GREATEST(COUNT(DISTINCT cd.id), 1)::float * 100) as participation_rate
		FROM team_members tm
		LEFT JOIN evaluations e ON tm.id = e.evaluator_id
		LEFT JOIN customer_decisions cd ON e.decision_id = cd.id AND cd.team_id = tm.team_id
		WHERE tm.team_id = $1 AND tm.is_active = true
		GROUP BY tm.id, tm.name, tm.role
		ORDER BY evaluations_count DESC
	`, teamID)
	if err != nil {
		memberPerformance = []MemberPerformance{}
	}

	c.JSON(http.StatusOK, gin.H{
		"member_performance": memberPerformance,
	})
}

// ExportAnalytics exports analytics data (placeholder for future implementation)
func (h *AnalyticsHandler) ExportAnalytics(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Analytics export not implemented yet"})
}

// calculateDateRange determines the start date and normalizes the period string
func (h *AnalyticsHandler) calculateDateRange(period string) (time.Time, string) {
	now := time.Now()

	switch period {
	case "7d":
		return now.AddDate(0, 0, -7), period
	case "30d":
		return now.AddDate(0, 0, -30), period
	case "90d":
		return now.AddDate(0, 0, -90), period
	default:
		return now.AddDate(0, 0, -30), "30d" // Default to 30 days
	}
}

// calculateTeamEfficiency computes team efficiency metrics for the analytics dashboard
func (h *AnalyticsHandler) calculateTeamEfficiency(c *gin.Context, teamID uuid.UUID, startDate time.Time) gin.H {
	var avgEvaluationTime float64
	var participationRate float64

	// Calculate average time from decision creation to first evaluation
	err := h.db.GetContext(c, &avgEvaluationTime, `
		SELECT COALESCE(
			AVG(EXTRACT(EPOCH FROM (e.created_at - cd.created_at)) / 3600), 0
		)
		FROM customer_decisions cd
		JOIN evaluations e ON cd.id = e.decision_id
		WHERE cd.team_id = $1 AND cd.created_at >= $2
	`, teamID, startDate)
	if err != nil {
		avgEvaluationTime = 0
	}

	// Calculate overall participation rate
	var totalEvaluationSlots, completedEvaluations int
	err = h.db.GetContext(c, &totalEvaluationSlots, `
		SELECT COUNT(cd.id) * (
			SELECT COUNT(*) FROM team_members WHERE team_id = $1 AND is_active = true
		)
		FROM customer_decisions cd
		WHERE cd.team_id = $1 AND cd.created_at >= $2
	`, teamID, startDate)
	if err != nil {
		totalEvaluationSlots = 1 // Avoid division by zero
	}

	err = h.db.GetContext(c, &completedEvaluations, `
		SELECT COUNT(DISTINCT e.evaluator_id || e.decision_id)
		FROM evaluations e
		JOIN customer_decisions cd ON e.decision_id = cd.id
		WHERE cd.team_id = $1 AND cd.created_at >= $2
	`, teamID, startDate)
	if err != nil {
		completedEvaluations = 0
	}

	if totalEvaluationSlots > 0 {
		participationRate = float64(completedEvaluations) / float64(totalEvaluationSlots) * 100
	}

	return gin.H{
		"avg_evaluation_time":      avgEvaluationTime,
		"participation_rate":       participationRate,
		"conflict_resolution_rate": 0.0, // Placeholder
	}
}
