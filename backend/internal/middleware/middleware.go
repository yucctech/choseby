package middleware

import (
	"net/http"
	"strings"
	"sync"
	"time"

	"choseby-backend/internal/auth"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// SecurityHeaders adds security headers to all responses
func SecurityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Header("Content-Security-Policy", "default-src 'self'")
		c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		c.Next()
	}
}

// HTTPSRedirect enforces HTTPS in production
func HTTPSRedirect() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.GetHeader("X-Forwarded-Proto") == "http" {
			httpsURL := "https://" + c.Request.Host + c.Request.RequestURI
			c.Redirect(http.StatusMovedPermanently, httpsURL)
			c.Abort()
			return
		}
		c.Next()
	}
}

// RequestID adds a unique request ID to each request
func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = uuid.New().String()
		}
		c.Header("X-Request-ID", requestID)
		c.Set("request_id", requestID)
		c.Next()
	}
}

// RateLimit implements token bucket rate limiting per IP
func RateLimit(limit, window int) gin.HandlerFunc {
	type bucket struct {
		tokens     int
		lastRefill time.Time
	}

	buckets := make(map[string]*bucket)
	var mu sync.Mutex

	return func(c *gin.Context) {
		ip := c.ClientIP()

		mu.Lock()
		defer mu.Unlock()

		b, exists := buckets[ip]
		if !exists {
			b = &bucket{tokens: limit, lastRefill: time.Now()}
			buckets[ip] = b
		}

		// Refill tokens based on time elapsed
		elapsed := time.Since(b.lastRefill).Seconds()
		tokensToAdd := int(elapsed * float64(limit) / float64(window))
		if tokensToAdd > 0 {
			b.tokens = min(limit, b.tokens+tokensToAdd)
			b.lastRefill = time.Now()
		}

		if b.tokens <= 0 {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":   "rate_limit_exceeded",
				"message": "Too many requests. Please try again later.",
			})
			c.Abort()
			return
		}

		b.tokens--
		c.Next()
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// AuthRequired validates JWT tokens
func AuthRequired(authService *auth.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		bearerToken := strings.Split(authHeader, " ")
		if len(bearerToken) != 2 || bearerToken[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
			c.Abort()
			return
		}

		claims, err := authService.ValidateToken(bearerToken[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		c.Set("claims", claims)
		c.Set("user_id", claims.UserID)
		c.Set("user_email", claims.Email)
		c.Set("user_role", claims.Role)
		c.Next()
	}
}

// TeamMember checks if user is a member of the team (simplified for customer response platform)
func TeamMember() gin.HandlerFunc {
	return func(c *gin.Context) {
		// In the customer response platform, authenticated users are team members
		// More sophisticated team verification would be implemented here
		c.Next()
	}
}

// TeamAdmin checks if user is an admin of the team
func TeamAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("user_role")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
			c.Abort()
			return
		}

		role := userRole.(string)
		if role == "customer_success_manager" || role == "operations_manager" {
			c.Next()
			return
		}

		c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
		c.Abort()
	}
}

// Permission checks if user has specific permission (simplified for customer response platform)
func Permission(required string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// In the customer response platform, we use role-based access
		// More sophisticated permission checking would be implemented here
		c.Next()
	}
}

// WebSocketAuth validates WebSocket connections
func WebSocketAuth(authService *auth.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.Query("token")
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token required for WebSocket"})
			c.Abort()
			return
		}

		claims, err := authService.ValidateToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Next()
	}
}
