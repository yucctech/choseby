package scripts

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
	"os"
)

func HashPassword() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run hash.go <password>")
		os.Exit(1)
	}

	password := os.Args[1]
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		fmt.Println("Error:", err)
		os.Exit(1)
	}

	fmt.Println(string(hash))
}
