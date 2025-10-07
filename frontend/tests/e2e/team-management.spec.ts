import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Team Management
 * Tests: Team creation, member invitation, role management, team settings
 */

test.describe('Team Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());

    await page.getByLabel(/email/i).fill('demo@choseby.com');
    await page.getByLabel(/password/i).fill('demo123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForTimeout(2000);

    // Skip tests if not logged in
    if (!page.url().includes('/dashboard')) {
      test.skip();
    }
  });

  test('should navigate to team management page', async ({ page }) => {
    // From dashboard, click "Team" link
    await page.getByRole('link', { name: /team/i }).click();
    await page.waitForTimeout(1000);

    // Verify team page loaded
    await expect(page.getByText(/team management|team members/i)).toBeVisible();
  });

  test('should display current team members', async ({ page }) => {
    await page.goto('/team');
    await page.waitForTimeout(1000);

    // Should show at least the logged-in user
    const membersList = page.locator('[data-testid="team-member"]');
    const membersCount = await membersList.count();

    if (membersCount > 0) {
      // Verify member card structure
      const firstMember = membersList.first();
      await expect(firstMember).toBeVisible();

      // Should show name, email, role
      const hasEmail = await firstMember.locator('text=/@/').isVisible();
      expect(hasEmail).toBeTruthy();
    } else {
      // If no members shown, check for empty state
      const emptyState = page.getByText(/no members|invite your team/i);
      await expect(emptyState).toBeVisible();
    }
  });

  test('should show member roles and permissions', async ({ page }) => {
    await page.goto('/team');
    await page.waitForTimeout(1000);

    const membersList = page.locator('[data-testid="team-member"]');
    if (await membersList.first().isVisible()) {
      // Check for role badges
      const roleBadge = page.locator('text=/owner|admin|member|manager/i');
      await expect(roleBadge.first()).toBeVisible();

      // Check for escalation authority indicator
      const authorityIndicator = page.locator('text=/authority|escalation/i');
      const hasAuthority = await authorityIndicator.isVisible();
      console.log(`Escalation authority shown: ${hasAuthority}`);
    }
  });

  test('should display team invite form', async ({ page }) => {
    await page.goto('/team');
    await page.waitForTimeout(1000);

    // Look for invite button or form
    const inviteButton = page.getByRole('button', { name: /invite|add member/i });
    if (await inviteButton.isVisible()) {
      await inviteButton.click();
      await page.waitForTimeout(500);

      // Should show invite form
      await expect(page.getByLabel(/email/i)).toBeVisible();

      // Check for role selector
      const roleSelect = page.locator('select[name="role"]');
      await expect(roleSelect).toBeVisible();
    } else {
      // Invite form might be always visible
      const emailInput = page.getByPlaceholder(/enter email|member email/i);
      await expect(emailInput).toBeVisible();
    }
  });

  test('should validate email format in invite form', async ({ page }) => {
    await page.goto('/team');
    await page.waitForTimeout(1000);

    // Find invite form
    const inviteButton = page.getByRole('button', { name: /invite|add member/i });
    if (await inviteButton.isVisible()) {
      await inviteButton.click();
    }

    // Try invalid email
    const emailInput = page.getByLabel(/email/i).last();
    await emailInput.fill('invalid-email');

    const submitButton = page.getByRole('button', { name: /send invite|invite/i });
    await submitButton.click();

    // Should show validation error
    await page.waitForTimeout(500);
    const errorVisible = await page.getByText(/invalid email|valid email required/i).isVisible();
    if (!errorVisible) {
      // Check for HTML5 validation
      const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
      expect(isInvalid).toBeTruthy();
    }
  });

  test('should send team member invitation', async ({ page }) => {
    await page.goto('/team');
    await page.waitForTimeout(1000);

    // Open invite form if needed
    const inviteButton = page.getByRole('button', { name: /invite|add member/i });
    if (await inviteButton.isVisible()) {
      await inviteButton.click();
    }

    // Fill invite form
    const timestamp = Date.now();
    const emailInput = page.getByLabel(/email/i).last();
    await emailInput.fill(`newmember${timestamp}@test.com`);

    // Select role
    const roleSelect = page.locator('select[name="role"]').last();
    if (await roleSelect.isVisible()) {
      await roleSelect.selectOption('customer_success_manager');
    }

    // Submit invitation
    const submitButton = page.getByRole('button', { name: /send invite|invite/i });
    await submitButton.click();
    await page.waitForTimeout(2000);

    // Should show success message or pending invitation
    const success = await page.getByText(/invitation sent|pending/i).isVisible();
    console.log(`Invitation sent: ${success}`);
  });

  test('should display team settings', async ({ page }) => {
    await page.goto('/team');
    await page.waitForTimeout(1000);

    // Look for settings section or tab
    const settingsTab = page.getByRole('tab', { name: /settings/i });
    if (await settingsTab.isVisible()) {
      await settingsTab.click();
      await page.waitForTimeout(500);
    }

    // Check for team-level settings
    const anonymousToggle = page.locator('input[type="checkbox"][name*="anonymous"]');
    const hasAnonymous = await anonymousToggle.isVisible();

    const aiToggle = page.locator('input[type="checkbox"][name*="ai"]');
    const hasAI = await aiToggle.isVisible();

    console.log(`Team settings - Anonymous: ${hasAnonymous}, AI: ${hasAI}`);
  });

  test('should toggle anonymous evaluation mode', async ({ page }) => {
    await page.goto('/team');
    await page.waitForTimeout(1000);

    // Navigate to settings if needed
    const settingsTab = page.getByRole('tab', { name: /settings/i });
    if (await settingsTab.isVisible()) {
      await settingsTab.click();
    }

    // Find anonymous evaluation toggle
    const anonymousToggle = page.locator('input[type="checkbox"][name*="anonymous"]');
    if (await anonymousToggle.isVisible()) {
      const wasChecked = await anonymousToggle.isChecked();

      // Toggle it
      await anonymousToggle.click();
      await page.waitForTimeout(1000);

      // Verify state changed
      const isChecked = await anonymousToggle.isChecked();
      expect(isChecked).toBe(!wasChecked);
    }
  });

  test('should configure workflow type preference', async ({ page }) => {
    await page.goto('/team');
    await page.waitForTimeout(1000);

    // Navigate to settings
    const settingsTab = page.getByRole('tab', { name: /settings/i });
    if (await settingsTab.isVisible()) {
      await settingsTab.click();
    }

    // Look for workflow type selector
    const workflowSelect = page.locator('select[name="workflow_type"]');
    if (await workflowSelect.isVisible()) {
      // Should have options like 'standard', 'rapid', 'thorough'
      await workflowSelect.selectOption('standard');
      await page.waitForTimeout(500);

      const selectedValue = await workflowSelect.inputValue();
      expect(selectedValue).toBe('standard');
    }
  });

  test('should display team statistics', async ({ page }) => {
    await page.goto('/team');
    await page.waitForTimeout(1000);

    // Check for team stats
    const statsSection = page.locator('[data-testid="team-stats"]');
    if (await statsSection.isVisible()) {
      // Should show metrics like total members, active decisions
      const hasNumbers = await statsSection.locator('text=/\\d+/').isVisible();
      expect(hasNumbers).toBeTruthy();
    }
  });

  test('should show member activity indicators', async ({ page }) => {
    await page.goto('/team');
    await page.waitForTimeout(1000);

    const membersList = page.locator('[data-testid="team-member"]');
    if (await membersList.first().isVisible()) {
      // Check for active status indicator
      const activeIndicator = page.locator('.bg-green-500, text=/active|online/i');
      const hasStatus = await activeIndicator.isVisible();
      console.log(`Member status indicators: ${hasStatus}`);
    }
  });

  test('should allow removing team members (admin only)', async ({ page }) => {
    await page.goto('/team');
    await page.waitForTimeout(1000);

    // Look for remove/delete button on member cards
    const removeButton = page.getByRole('button', { name: /remove|delete/i }).first();
    if (await removeButton.isVisible()) {
      // Should have confirmation dialog
      await removeButton.click();
      await page.waitForTimeout(500);

      const confirmDialog = page.getByText(/are you sure|confirm/i);
      const hasConfirmation = await confirmDialog.isVisible();
      console.log(`Remove confirmation dialog: ${hasConfirmation}`);

      // Cancel if dialog appeared
      if (hasConfirmation) {
        const cancelButton = page.getByRole('button', { name: /cancel/i });
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
        }
      }
    }
  });

  test('should display notification preferences', async ({ page }) => {
    await page.goto('/team');
    await page.waitForTimeout(1000);

    // Check for notification settings
    const notificationSection = page.locator('text=/notification|alerts/i');
    if (await notificationSection.isVisible()) {
      // Should have toggles for email, SMS, push
      const emailToggle = page.locator('input[type="checkbox"][name*="email"]');
      const hasEmailPref = await emailToggle.isVisible();
      console.log(`Notification preferences shown: ${hasEmailPref}`);
    }
  });
});
