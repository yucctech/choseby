package ai

import (
	"context"
	"fmt"
	"sync"
	"time"
)

// RateLimiter implements token bucket rate limiting for AI API calls
type RateLimiter struct {
	tokens     int
	maxTokens  int
	refillRate time.Duration
	mu         sync.Mutex
	lastRefill time.Time
}

// NewRateLimiter creates a new rate limiter
// requestsPerMinute: maximum number of requests allowed per minute
func NewRateLimiter(requestsPerMinute int) *RateLimiter {
	return &RateLimiter{
		tokens:     requestsPerMinute,
		maxTokens:  requestsPerMinute,
		refillRate: time.Minute / time.Duration(requestsPerMinute),
		lastRefill: time.Now(),
	}
}

// Wait blocks until a token is available or context is cancelled
func (rl *RateLimiter) Wait(ctx context.Context) error {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	// Refill tokens based on time passed
	now := time.Now()
	elapsed := now.Sub(rl.lastRefill)
	tokensToAdd := int(elapsed / rl.refillRate)

	if tokensToAdd > 0 {
		rl.tokens = min(rl.tokens+tokensToAdd, rl.maxTokens)
		rl.lastRefill = now
	}

	// If we have tokens, consume one and return immediately
	if rl.tokens > 0 {
		rl.tokens--
		return nil
	}

	// Calculate wait time for next token
	waitTime := rl.refillRate - (now.Sub(rl.lastRefill) % rl.refillRate)

	// Unlock while waiting
	rl.mu.Unlock()

	select {
	case <-time.After(waitTime):
		rl.mu.Lock()
		rl.tokens = rl.maxTokens - 1 // Consume the new token
		rl.lastRefill = time.Now()
		return nil
	case <-ctx.Done():
		rl.mu.Lock()
		return ctx.Err()
	}
}

// TryAcquire attempts to acquire a token without blocking
// Returns true if token was acquired, false otherwise
func (rl *RateLimiter) TryAcquire() bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	// Refill tokens based on time passed
	now := time.Now()
	elapsed := now.Sub(rl.lastRefill)
	tokensToAdd := int(elapsed / rl.refillRate)

	if tokensToAdd > 0 {
		rl.tokens = min(rl.tokens+tokensToAdd, rl.maxTokens)
		rl.lastRefill = now
	}

	// Try to consume a token
	if rl.tokens > 0 {
		rl.tokens--
		return true
	}

	return false
}

// Available returns the number of currently available tokens
func (rl *RateLimiter) Available() int {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	// Refill tokens based on time passed
	now := time.Now()
	elapsed := now.Sub(rl.lastRefill)
	tokensToAdd := int(elapsed / rl.refillRate)

	if tokensToAdd > 0 {
		rl.tokens = min(rl.tokens+tokensToAdd, rl.maxTokens)
		rl.lastRefill = now
	}

	return rl.tokens
}

// Stats returns current rate limiter statistics
func (rl *RateLimiter) Stats() map[string]interface{} {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	return map[string]interface{}{
		"available_tokens": rl.tokens,
		"max_tokens":       rl.maxTokens,
		"refill_rate_ms":   rl.refillRate.Milliseconds(),
		"last_refill":      rl.lastRefill.Format(time.RFC3339),
	}
}

// Reset resets the rate limiter to full capacity
func (rl *RateLimiter) Reset() {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	rl.tokens = rl.maxTokens
	rl.lastRefill = time.Now()
}

// RateLimitError represents a rate limit exceeded error
type RateLimitError struct {
	RetryAfter time.Duration
}

func (e *RateLimitError) Error() string {
	return fmt.Sprintf("rate limit exceeded, retry after %v", e.RetryAfter)
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
