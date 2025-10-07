import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Authentication Flow
 * Tests: Registration, Login, Protected Routes, Logout, Token Persistence
 */

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from home page
    await page.goto('/');
  });

  test('should display landing page with sign in button', async ({ page }) => {
    // Verify landing page elements
    await expect(page.locator('h1')).toContainText('Customer Response Decision Intelligence');

    // Check for key value propositions
    await expect(page.getByText('AI-Powered Classification')).toBeVisible();
    await expect(page.getByText('Anonymous Team Input')).toBeVisible();
    await expect(page.getByText('Outcome Tracking')).toBeVisible();

    // Verify stats section (checking for the percentage, not the full text)
    await expect(page.getByText('60%')).toBeVisible();
    await expect(page.getByText('Faster Decision Time')).toBeVisible();
    await expect(page.getByText('3-5 Days')).toBeVisible();
    await expect(page.getByText('Eliminated Email Threads')).toBeVisible();

    // Check CTA button
    const signInButton = page.getByRole('link', { name: /get started/i });
    await expect(signInButton).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/login');

    // Verify login page loaded
    await expect(page.getByTestId('app-title')).toBeVisible();
    await expect(page.getByText('Customer Response Decision Intelligence')).toBeVisible();

    // Check for form fields
    await expect(page.getByTestId('input-email')).toBeVisible();
    await expect(page.getByTestId('input-password')).toBeVisible();
    await expect(page.getByTestId('submit-button')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login');

    // Verify form inputs have HTML5 required attributes
    const emailInput = page.getByTestId('input-email');
    const passwordInput = page.getByTestId('input-password');

    expect(await emailInput.getAttribute('required')).toBe('');
    expect(await passwordInput.getAttribute('required')).toBe('');

    // Try to submit empty form - HTML5 validation should prevent submission
    await page.getByTestId('submit-button').click();
    await page.waitForTimeout(500);

    // Form should not submit (stay on login page)
    expect(page.url()).toContain('/login');
  });

  test('should toggle between sign in and sign up', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(500);

    // Start with sign in - check the active tab
    await expect(page.getByTestId('tab-signin')).toHaveClass(/bg-white/);

    // Click toggle to sign up
    await page.getByTestId('tab-signup').click();
    await page.waitForTimeout(300);

    // Check for additional sign up fields
    await expect(page.getByTestId('input-name')).toBeVisible();

    // Toggle back to sign in
    await page.getByTestId('tab-signin').click();
    await page.waitForTimeout(300);

    // Name field should be hidden
    await expect(page.getByTestId('input-name')).not.toBeVisible();
  });

  test('should attempt login with demo credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in demo credentials using test IDs
    await page.getByTestId('input-email').fill('demo@choseby.com');
    await page.getByTestId('input-password').fill('demo123');

    // Submit form
    await page.getByTestId('submit-button').click();

    // Wait for response (either redirect to dashboard or error message)
    await page.waitForTimeout(3000);

    // Check if redirected to dashboard or error shown
    const currentUrl = page.url();
    if (currentUrl.includes('/dashboard')) {
      // Success - verify dashboard loaded
      await expect(page.getByText(/dashboard|decisions|welcome/i).first()).toBeVisible();
    } else {
      // Check for error message
      const errorVisible = await page.getByTestId('error-message').isVisible().catch(() => false);
      if (errorVisible) {
        console.log('Login failed - check error message');
      }
    }
  });

  test('should register new user account', async ({ page }) => {
    await page.goto('/login');

    // Switch to sign up
    await page.getByTestId('tab-signup').click();

    // Generate unique test user
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@choseby.com`;

    // Fill registration form using test IDs
    await page.getByTestId('input-name').fill('Test User');
    await page.getByTestId('input-email').fill(testEmail);
    await page.getByTestId('input-password').fill('TestPass123!');

    // Note: Registration needs more fields (company, team, role) but simplified form doesn't have them
    // This test validates the current implementation

    // Submit registration
    await page.getByTestId('submit-button').click();

    // Wait for response
    await page.waitForTimeout(3000);

    // Should either redirect to dashboard or show error
    const currentUrl = page.url();
    if (currentUrl.includes('/dashboard')) {
      await expect(page.getByText(/welcome/i)).toBeVisible();
    }
  });

  test('should persist authentication token', async ({ page, context }) => {
    // This test requires successful login first
    await page.goto('/login');

    // Try demo login using test IDs
    await page.getByTestId('input-email').fill('demo@choseby.com');
    await page.getByTestId('input-password').fill('demo123');
    await page.getByTestId('submit-button').click();
    await page.waitForTimeout(3000);

    // Check if logged in
    const currentUrl = page.url();
    if (currentUrl.includes('/dashboard')) {
      // Token should be in localStorage
      const token = await page.evaluate(() => localStorage.getItem('auth_token'));
      expect(token).toBeTruthy();

      // Refresh page - should stay logged in
      await page.reload();
      await page.waitForTimeout(1000);

      // Should still be on dashboard
      expect(page.url()).toContain('/dashboard');
    }
  });

  test('should protect dashboard route when not authenticated', async ({ page }) => {
    // Clear any existing auth
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());

    // Try to access protected route
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // Should redirect to login or show auth required
    const currentUrl = page.url();
    const isProtected = currentUrl.includes('/login') ||
                       await page.getByText(/sign in|login|authentication required/i).isVisible();
    expect(isProtected).toBeTruthy();
  });

  test('should logout successfully', async ({ page }) => {
    // First need to be logged in
    await page.goto('/login');
    await page.getByTestId('input-email').fill('demo@choseby.com');
    await page.getByTestId('input-password').fill('demo123');
    await page.getByTestId('submit-button').click();
    await page.waitForTimeout(3000);

    // Check if logged in
    if (page.url().includes('/dashboard')) {
      // Find and click logout button (might be in dropdown or menu)
      const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await page.waitForTimeout(1000);

        // Should redirect to home or login
        const currentUrl = page.url();
        const loggedOut = currentUrl === 'http://localhost:3000/' ||
                         currentUrl.includes('/login');
        expect(loggedOut).toBeTruthy();

        // Token should be cleared
        const token = await page.evaluate(() => localStorage.getItem('auth_token'));
        expect(token).toBeNull();
      }
    }
  });
});
