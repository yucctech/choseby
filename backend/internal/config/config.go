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

	// Healthcare SSO
	EpicClientID     string
	EpicClientSecret string
	CernerClientID   string
	CernerClientSecret string

	// API Configuration
	APIRateLimit  int
	APIRateWindow int
	CORSOrigins   []string

	// Healthcare Compliance
	HIPAAEncryptionKey   string
	AuditRetentionYears  int
	DataExportEncryption bool

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

	return &Config{
		// Database
		DatabaseURL:      dbURL,
		DatabasePoolSize: getEnvInt("DATABASE_POOL_SIZE", 20),

		// JWT
		JWTSecret:             jwtSecret,
		JWTExpiration:         getEnvInt("JWT_EXPIRATION", 3600),
		RefreshTokenExpiration: getEnvInt("REFRESH_TOKEN_EXPIRATION", 604800),

		// Healthcare SSO
		EpicClientID:     getEnv("EPIC_CLIENT_ID", ""),
		EpicClientSecret: getEnv("EPIC_CLIENT_SECRET", ""),
		CernerClientID:   getEnv("CERNER_CLIENT_ID", ""),
		CernerClientSecret: getEnv("CERNER_CLIENT_SECRET", ""),

		// API Configuration
		APIRateLimit:  getEnvInt("API_RATE_LIMIT", 1000),
		APIRateWindow: getEnvInt("API_RATE_WINDOW", 3600),
		CORSOrigins:   strings.Split(getEnv("CORS_ORIGINS", "http://localhost:3000"), ","),

		// Healthcare Compliance
		HIPAAEncryptionKey:   getEnv("HIPAA_ENCRYPTION_KEY", ""),
		AuditRetentionYears:  getEnvInt("AUDIT_RETENTION_YEARS", 7),
		DataExportEncryption: getEnvBool("DATA_EXPORT_ENCRYPTION", true),

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