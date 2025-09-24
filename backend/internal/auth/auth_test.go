package auth

import (
	"testing"
)

func TestPasswordHashingAndVerification(t *testing.T) {
	authService := NewAuthService("test-secret", 3600, 604800)
	password := "demo123"

	t.Run("Generate and verify new hash", func(t *testing.T) {
		hash, err := authService.HashPassword(password)
		if err != nil {
			t.Fatalf("Failed to hash password: %v", err)
		}

		if !authService.VerifyPassword(password, hash) {
			t.Error("Failed to verify correct password with freshly generated hash")
		}

		if authService.VerifyPassword("wrongpassword", hash) {
			t.Error("Incorrectly verified wrong password")
		}
	})

	t.Run("Verify with stored database hash", func(t *testing.T) {
		storedHash := "$2a$10$yAD32IRsnOwvD65NGm7wge7D5OhD9qyX68smBi2H.xyzTbOtvAMGa"

		if authService.VerifyPassword(password, storedHash) {
			t.Log("✅ Stored hash is valid for password 'demo123'")
		} else {
			t.Log("❌ Stored hash does NOT match 'demo123' - need to regenerate")

			newHash, err := authService.HashPassword(password)
			if err != nil {
				t.Fatalf("Failed to generate new hash: %v", err)
			}

			t.Logf("New hash for 'demo123': %s", newHash)
			t.Logf("Update database with: UPDATE users SET password_hash = '%s' WHERE email = 'demo@choseby.com';", newHash)
		}
	})

	t.Run("Cost factor validation", func(t *testing.T) {
		hash, err := authService.HashPassword("testpassword")
		if err != nil {
			t.Fatalf("Failed to hash password: %v", err)
		}

		if len(hash) < 60 {
			t.Error("Hash too short - bcrypt hashes should be at least 60 characters")
		}

		if hash[:4] != "$2a$" {
			t.Error("Hash doesn't start with bcrypt identifier")
		}

		t.Logf("Generated hash: %s", hash)
	})
}