package config

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	// Database
	DatabaseURL      string
	DatabasePoolSize int

	// JWT
	JWTSecret             string
	JWTExpiration         int
	RefreshTokenExpiration int

	// AI Integration
	DeepSeekAPIKey    string
	DeepSeekAPIURL    string
	AIRequestTimeout  int

	// API Configuration
	APIRateLimit  int
	APIRateWindow int
	CORSOrigins   []string

	// Customer Response Platform
	MaxTeamMembers         int
	MaxDecisionsPerTeam    int
	EvaluationTimeoutHours int

	// WebSocket
	WSMaxConnections    int
	WSHeartbeatInterval int

	// Server
	Port        string
	Environment string
}

func Load() *Config {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	jwtSecret := getEnv("JWT_SECRET", "")
	if jwtSecret == "" || jwtSecret == "your-super-secure-jwt-secret-change-in-production" {
		log.Fatal("FATAL: JWT_SECRET environment variable must be set to a strong secret (min 32 characters)")
	}

	dbURL := getEnv("DATABASE_URL", "")
	if dbURL == "" {
		log.Fatal("FATAL: DATABASE_URL environment variable is required")
	}

	deepSeekAPIKey := getEnv("DEEPSEEK_API_KEY", "")
	if deepSeekAPIKey == "" {
		log.Println("WARNING: DEEPSEEK_API_KEY not set - AI features will be disabled")
	}

	return &Config{
		// Database
		DatabaseURL:      dbURL,
		DatabasePoolSize: getEnvInt("DATABASE_POOL_SIZE", 20),

		// JWT
		JWTSecret:             jwtSecret,
		JWTExpiration:         getEnvInt("JWT_EXPIRATION", 3600),
		RefreshTokenExpiration: getEnvInt("REFRESH_TOKEN_EXPIRATION", 604800),

		// AI Integration
		DeepSeekAPIKey:    deepSeekAPIKey,
		DeepSeekAPIURL:    getEnv("DEEPSEEK_API_URL", "https://api.deepseek.com/v1"),
		AIRequestTimeout:  getEnvInt("AI_REQUEST_TIMEOUT", 30),

		// API Configuration
		APIRateLimit:  getEnvInt("API_RATE_LIMIT", 1000),
		APIRateWindow: getEnvInt("API_RATE_WINDOW", 3600),
		CORSOrigins:   strings.Split(getEnv("CORS_ORIGINS", "http://localhost:3000,https://choseby.vercel.app"), ","),

		// Customer Response Platform
		MaxTeamMembers:         getEnvInt("MAX_TEAM_MEMBERS", 25),
		MaxDecisionsPerTeam:    getEnvInt("MAX_DECISIONS_PER_TEAM", 100),
		EvaluationTimeoutHours: getEnvInt("EVALUATION_TIMEOUT_HOURS", 72),

		// WebSocket
		WSMaxConnections:    getEnvInt("WS_MAX_CONNECTIONS", 1000),
		WSHeartbeatInterval: getEnvInt("WS_HEARTBEAT_INTERVAL", 30000),

		// Server
		Port:        getEnv("PORT", "8080"),
		Environment: getEnv("ENVIRONMENT", "development"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}