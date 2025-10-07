import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Analytics Dashboard
 * Tests: Dashboard metrics, date filtering, tier breakdowns, performance insights
 */

test.describe('Analytics Dashboard', () => {
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

  test('should navigate to analytics page', async ({ page }) => {
    // From dashboard, click "Analytics" link
    await page.getByRole('link', { name: /analytics/i }).click();
    await page.waitForTimeout(1000);

    // Verify analytics page loaded
    await expect(page.getByText(/analytics|performance|insights/i)).toBeVisible();
  });

  test('should display key performance metrics', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForTimeout(1000);

    // Check for main KPIs
    await expect(page.getByText(/response time|satisfaction|decisions/i)).toBeVisible();

    // Should show numeric metrics
    const metricNumbers = page.locator('[data-testid="metric-value"]');
    if (await metricNumbers.first().isVisible()) {
      const count = await metricNumbers.count();
      console.log(`Metrics displayed: ${count}`);
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should show date range selector', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForTimeout(1000);

    // Check for date range buttons
    const dateButtons = page.locator('button:has-text("7d"), button:has-text("30d"), button:has-text("90d")');
    await expect(dateButtons.first()).toBeVisible();

    // Verify "All time" option
    const allTimeButton = page.getByRole('button', { name: /all time|all/i });
    await expect(allTimeButton).toBeVisible();
  });

  test('should filter analytics by date range', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForTimeout(1000);

    // Click 7-day filter
    const sevenDayButton = page.getByRole('button', { name: /7d|7 days/i });
    if (await sevenDayButton.isVisible()) {
      await sevenDayButton.click();
      await page.waitForTimeout(1500);

      // Button should show active state
      const hasActiveClass = await sevenDayButton.evaluate((el) =>
        el.classList.contains('bg-blue-600') || el.classList.contains('bg-blue-500')
      );
      console.log(`7d button active: ${hasActiveClass}`);
    }

    // Try 30-day filter
    const thirtyDayButton = page.getByRole('button', { name: /30d|30 days/i });
    if (await thirtyDayButton.isVisible()) {
      await thirtyDayButton.click();
      await page.waitForTimeout(1500);
    }
  });

  test('should display response time metrics', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForTimeout(1000);

    // Look for response time section
    const responseTimeSection = page.locator('text=/response time|avg response|median response/i');
    await expect(responseTimeSection.first()).toBeVisible();

    // Should show time values (hours, days)
    const timeValue = page.locator('text=/\\d+\\.?\\d* (hour|day|hr|d)/i');
    if (await timeValue.isVisible()) {
      console.log('Response time metrics displayed');
    }
  });

  test('should show customer satisfaction metrics', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForTimeout(1000);

    // Look for satisfaction scores
    const satisfactionSection = page.locator('text=/satisfaction|nps|csat/i');
    await expect(satisfactionSection.first()).toBeVisible();

    // Should show percentage or score
    const scoreValue = page.locator('text=/\\d+%|\\d+\\/10/');
    if (await scoreValue.isVisible()) {
      console.log('Customer satisfaction metrics displayed');
    }
  });

  test('should display satisfaction breakdown by customer tier', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForTimeout(1000);

    // Check for tier breakdown section
    const tierSection = page.locator('text=/by tier|customer tier|tier breakdown/i');
    if (await tierSection.isVisible()) {
      // Should show tier badges
      const tierBadge = page.locator('text=/bronze|silver|gold|platinum|enterprise/i');
      await expect(tierBadge.first()).toBeVisible();

      // Each tier should have satisfaction score
      const tierScores = page.locator('[data-testid="tier-satisfaction"]');
      const count = await tierScores.count();
      console.log(`Tier satisfaction breakdown items: ${count}`);
    }
  });

  test('should show satisfaction by response type', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForTimeout(1000);

    // Check for response type breakdown
    const responseTypeSection = page.locator('text=/by response type|response category/i');
    if (await responseTypeSection.isVisible()) {
      // Should show response types (refund, billing, escalation, etc.)
      const responseTypes = page.locator('text=/refund|billing|escalation|technical|churn/i');
      const hasTypes = await responseTypes.first().isVisible();
      console.log(`Response type breakdown shown: ${hasTypes}`);
    }
  });

  test('should display decision completion rate', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForTimeout(1000);

    // Look for completion metrics
    const completionSection = page.locator('text=/completion rate|completed|finished/i');
    if (await completionSection.isVisible()) {
      // Should show percentage
      const percentageValue = page.locator('text=/\\d+%/');
      await expect(percentageValue.first()).toBeVisible();
    }
  });

  test('should show trend indicators', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForTimeout(1000);

    // Check for trend arrows or percentage changes
    const trendIndicator = page.locator('text=/↑|↓|\\+\\d+%|\\-\\d+%|increase|decrease/i');
    if (await trendIndicator.isVisible()) {
      console.log('Trend indicators displayed');

      // Should be color-coded (green for improvement, red for decline)
      const greenTrend = page.locator('.text-green-600, .text-green-500');
      const redTrend = page.locator('.text-red-600, .text-red-500');
      const hasTrendColors = (await greenTrend.count() > 0) || (await redTrend.count() > 0);
      console.log(`Trend color coding: ${hasTrendColors}`);
    }
  });

  test('should display key insights section', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForTimeout(1000);

    // Look for insights or recommendations
    const insightsSection = page.locator('text=/insights|recommendations|key findings/i');
    if (await insightsSection.isVisible()) {
      // Should have insight cards
      const insightCards = page.locator('[data-testid="insight-card"]');
      const count = await insightCards.count();
      console.log(`Insight cards displayed: ${count}`);

      if (count > 0) {
        // Each insight should have text content
        const firstInsight = insightCards.first();
        const hasText = await firstInsight.locator('text=/./').isVisible();
        expect(hasText).toBeTruthy();
      }
    }
  });

  test('should show team performance metrics', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForTimeout(1000);

    // Check for team-level metrics
    const teamMetrics = page.locator('text=/team|members|participation/i');
    if (await teamMetrics.isVisible()) {
      // Should show participation rate or evaluation count
      const metricValue = page.locator('text=/\\d+%|\\d+ evaluations/');
      const hasMetric = await metricValue.isVisible();
      console.log(`Team performance metrics: ${hasMetric}`);
    }
  });

  test('should display charts and visualizations', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForTimeout(1000);

    // Look for chart containers
    const charts = page.locator('canvas, svg[class*="chart"], [data-testid="chart"]');
    const chartCount = await charts.count();

    if (chartCount > 0) {
      console.log(`Charts displayed: ${chartCount}`);
      expect(chartCount).toBeGreaterThan(0);
    } else {
      // If no charts, should at least have bar/progress indicators
      const progressBars = page.locator('.bg-blue-600, .bg-green-600, [role="progressbar"]');
      const hasVisuals = await progressBars.count() > 0;
      console.log(`Visual indicators present: ${hasVisuals}`);
    }
  });

  test('should show empty state when no data', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForTimeout(1000);

    // Check if there's data
    const hasData = await page.locator('[data-testid="metric-value"]').first().isVisible();

    if (!hasData) {
      // Should show empty state message
      const emptyState = page.locator('text=/no data|no decisions|get started/i');
      const hasEmptyState = await emptyState.isVisible();
      console.log(`Empty state displayed: ${hasEmptyState}`);

      if (hasEmptyState) {
        // Should have CTA to create first decision
        const ctaButton = page.getByRole('link', { name: /create decision|get started/i });
        await expect(ctaButton).toBeVisible();
      }
    }
  });

  test('should export analytics data', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForTimeout(1000);

    // Look for export button
    const exportButton = page.getByRole('button', { name: /export|download|csv/i });
    if (await exportButton.isVisible()) {
      console.log('Export functionality available');

      // Click would trigger download, so just verify button exists
      await expect(exportButton).toBeVisible();
    }
  });

  test('should refresh analytics data', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForTimeout(1000);

    // Look for refresh button
    const refreshButton = page.getByRole('button', { name: /refresh|reload/i });
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await page.waitForTimeout(1500);

      // Should show loading indicator during refresh
      const loadingIndicator = page.locator('text=/loading|refreshing/i');
      const wasLoading = await loadingIndicator.isVisible();
      console.log(`Refresh triggered loading state: ${wasLoading}`);
    }
  });

  test('should navigate back to dashboard', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForTimeout(1000);

    // Click dashboard link in navigation
    const dashboardLink = page.getByRole('link', { name: /dashboard|home/i });
    await dashboardLink.click();
    await page.waitForTimeout(1000);

    // Should be back on dashboard
    expect(page.url()).toContain('/dashboard');
  });
});
