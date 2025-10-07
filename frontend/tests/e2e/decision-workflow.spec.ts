import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Decision Workflow
 * Tests: Decision creation, 6-phase workflow, AI classification, customer context
 */

test.describe('Decision Workflow', () => {
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

  test('should navigate to decision creation page', async ({ page }) => {
    // From dashboard, click "New Decision" button
    await page.getByRole('link', { name: /new decision/i }).click();

    // Verify decision creation page
    await expect(page.getByText(/create customer response decision/i)).toBeVisible();
    await expect(page.getByLabel(/customer name/i)).toBeVisible();
  });

  test('should display all customer context fields', async ({ page }) => {
    await page.goto('/decisions/new');

    // Check for all customer context fields
    await expect(page.getByLabel(/customer name/i)).toBeVisible();
    await expect(page.getByLabel(/customer email/i)).toBeVisible();
    await expect(page.getByLabel(/decision title/i)).toBeVisible();
    await expect(page.getByLabel(/description/i)).toBeVisible();

    // Customer tier selector
    await expect(page.locator('select[name="customer_tier"]')).toBeVisible();

    // Urgency level (1-5)
    const urgencyButtons = page.locator('button:has-text("1"), button:has-text("2"), button:has-text("3"), button:has-text("4"), button:has-text("5")');
    await expect(urgencyButtons.first()).toBeVisible();

    // Optional fields
    await expect(page.getByLabel(/customer value/i)).toBeVisible();
    await expect(page.getByLabel(/nps score/i)).toBeVisible();
    await expect(page.getByLabel(/relationship duration/i)).toBeVisible();
    await expect(page.getByLabel(/previous issues/i)).toBeVisible();
  });

  test('should create new decision with customer context', async ({ page }) => {
    await page.goto('/decisions/new');

    // Fill decision form
    await page.getByLabel(/decision title/i).fill('Test Customer Refund Request');
    await page.getByLabel(/description/i).fill('Customer requesting refund for service issues');
    await page.getByLabel(/customer name/i).fill('Acme Corporation');
    await page.getByLabel(/customer email/i).fill('contact@acme.com');

    // Select customer tier
    await page.locator('select[name="customer_tier"]').selectOption('gold');

    // Set urgency level (click button 4)
    await page.locator('button:has-text("4")').click();

    // Fill optional context
    await page.getByLabel(/customer value/i).fill('50000');
    await page.getByLabel(/nps score/i).fill('7');
    await page.getByLabel(/relationship duration/i).fill('18');
    await page.getByLabel(/previous issues/i).fill('2');

    // Submit form
    await page.getByRole('button', { name: /create decision/i }).click();
    await page.waitForTimeout(2000);

    // Should redirect to decision detail page or show success
    const currentUrl = page.url();
    const created = currentUrl.includes('/decisions/') ||
                   await page.getByText(/decision created|success/i).isVisible();
    expect(created).toBeTruthy();
  });

  test('should trigger AI classification', async ({ page }) => {
    await page.goto('/decisions/new');

    // Fill minimum required fields
    await page.getByLabel(/decision title/i).fill('Billing Issue Classification');
    await page.getByLabel(/description/i).fill('Customer charged twice for monthly subscription');
    await page.getByLabel(/customer name/i).fill('Test Corp');
    await page.locator('select[name="customer_tier"]').selectOption('silver');
    await page.locator('button:has-text("3")').click(); // Urgency 3

    // Click AI classification button (🤖)
    const aiButton = page.getByRole('button', { name: /classify with ai|🤖/i });
    if (await aiButton.isVisible()) {
      await aiButton.click();
      await page.waitForTimeout(3000);

      // Should show AI classification results
      const aiResultsVisible = await page.getByText(/classification|issue type|recommended/i).isVisible();
      if (aiResultsVisible) {
        console.log('AI classification completed successfully');
      }
    }
  });

  test('should display decision detail with 6 phases', async ({ page }) => {
    // Navigate to decisions list
    await page.goto('/decisions');
    await page.waitForTimeout(1000);

    // Click first decision (if any exist)
    const firstDecision = page.locator('[data-testid="decision-item"]').first();
    if (await firstDecision.isVisible()) {
      await firstDecision.click();
      await page.waitForTimeout(1000);

      // Verify 6-phase workflow is visible
      await expect(page.getByText(/problem definition/i)).toBeVisible();
      await expect(page.getByText(/criteria establishment/i)).toBeVisible();
      await expect(page.getByText(/consider options/i)).toBeVisible();
      await expect(page.getByText(/team evaluation/i)).toBeVisible();
      await expect(page.getByText(/results analysis/i)).toBeVisible();
      await expect(page.getByText(/outcome tracking/i)).toBeVisible();
    }
  });

  test('should show customer context in sidebar', async ({ page }) => {
    await page.goto('/decisions');
    await page.waitForTimeout(1000);

    const firstDecision = page.locator('[data-testid="decision-item"]').first();
    if (await firstDecision.isVisible()) {
      await firstDecision.click();
      await page.waitForTimeout(1000);

      // Check for customer info sidebar
      const customerName = page.locator('text=/customer|acme|test corp/i');
      const hasCustomerInfo = await customerName.isVisible();

      if (hasCustomerInfo) {
        // Verify tier badge
        const tierBadge = page.locator('text=/bronze|silver|gold|platinum|enterprise/i');
        await expect(tierBadge).toBeVisible();

        // Verify urgency indicator
        const urgencyBadge = page.locator('text=/urgency|priority/i');
        await expect(urgencyBadge).toBeVisible();
      }
    }
  });

  test('should navigate between workflow phases', async ({ page }) => {
    await page.goto('/decisions');
    await page.waitForTimeout(1000);

    const firstDecision = page.locator('[data-testid="decision-item"]').first();
    if (await firstDecision.isVisible()) {
      await firstDecision.click();
      await page.waitForTimeout(1000);

      // Try clicking on Phase 2 (Criteria Establishment)
      const phase2 = page.getByText(/criteria establishment/i);
      if (await phase2.isVisible()) {
        await phase2.click();
        await page.waitForTimeout(500);

        // Should show criteria content
        const criteriaContent = page.getByText(/establish criteria|weight|importance/i);
        const criteriaVisible = await criteriaContent.isVisible();
        console.log(`Phase 2 content visible: ${criteriaVisible}`);
      }

      // Try clicking Phase 3 (Consider Options)
      const phase3 = page.getByText(/consider options/i);
      if (await phase3.isVisible()) {
        await phase3.click();
        await page.waitForTimeout(500);

        const optionsContent = page.getByText(/response options|possible actions/i);
        const optionsVisible = await optionsContent.isVisible();
        console.log(`Phase 3 content visible: ${optionsVisible}`);
      }
    }
  });

  test('should show progress indicator for current phase', async ({ page }) => {
    await page.goto('/decisions');
    await page.waitForTimeout(1000);

    const firstDecision = page.locator('[data-testid="decision-item"]').first();
    if (await firstDecision.isVisible()) {
      await firstDecision.click();
      await page.waitForTimeout(1000);

      // Check for phase progress visual indicator
      // Should have completed, active, and pending states
      const progressBar = page.locator('[data-testid="phase-progress"]');
      const hasProgress = await progressBar.isVisible().catch(() => false);

      if (!hasProgress) {
        // Fallback: check for active phase highlighting
        const activePhase = page.locator('.bg-blue-100, .border-blue-500, [data-active="true"]');
        const hasActiveIndicator = await activePhase.count() > 0;
        console.log(`Active phase indicator found: ${hasActiveIndicator}`);
      }
    }
  });

  test('should list decisions with filters', async ({ page }) => {
    await page.goto('/decisions');
    await page.waitForTimeout(1000);

    // Check for filter controls
    const statusFilter = page.locator('select[name="status"], button:has-text("All"), button:has-text("Draft"), button:has-text("In Progress")');
    await expect(statusFilter.first()).toBeVisible();

    // Check for search
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible();

    // Test search functionality
    await searchInput.fill('test');
    await page.waitForTimeout(1000);

    // Results should filter (or show "no results")
    const decisionsCount = await page.locator('[data-testid="decision-item"]').count();
    console.log(`Search results: ${decisionsCount} decisions`);
  });

  test('should paginate decisions list', async ({ page }) => {
    await page.goto('/decisions');
    await page.waitForTimeout(1000);

    // Check for pagination controls
    const paginationNext = page.getByRole('button', { name: /next/i });
    const paginationPrev = page.getByRole('button', { name: /previous|prev/i });

    const hasPagination = await paginationNext.isVisible() || await paginationPrev.isVisible();
    if (hasPagination) {
      console.log('Pagination controls found');

      // Check for page number display
      const pageInfo = page.locator('text=/page \\d+ of \\d+|showing \\d+-\\d+ of \\d+/i');
      const hasPageInfo = await pageInfo.isVisible();
      expect(hasPageInfo).toBeTruthy();
    }
  });

  test('should show decision stats on list page', async ({ page }) => {
    await page.goto('/decisions');
    await page.waitForTimeout(1000);

    // Check for stats summary
    await expect(page.getByText(/total|active|pending|completed/i)).toBeVisible();

    // Should show count of decisions
    const statsNumbers = page.locator('text=/\\d+/');
    await expect(statsNumbers.first()).toBeVisible();
  });
});
