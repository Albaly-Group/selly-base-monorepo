import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility Tests using axe-core
 * 
 * These tests ensure the application meets WCAG 2.1 Level AA standards
 */

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should not have accessibility violations on home page', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have accessibility violations on companies page', async ({ page }) => {
    await page.goto('/companies');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have accessibility violations on dashboard', async ({ page }) => {
    // Note: May require authentication in real scenario
    await page.goto('/dashboard');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have accessibility violations on lists page', async ({ page }) => {
    await page.goto('/lists');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['heading-order'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/companies/new');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['label', 'label-title-only'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have sufficient color contrast', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have keyboard accessible navigation', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['focusable-content', 'tabindex'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['best-practice'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should generate detailed accessibility report', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();

    // Log results for detailed reporting
    console.log('Accessibility Scan Results:');
    console.log(`- Violations: ${accessibilityScanResults.violations.length}`);
    console.log(`- Passes: ${accessibilityScanResults.passes.length}`);
    console.log(`- Incomplete: ${accessibilityScanResults.incomplete.length}`);

    if (accessibilityScanResults.violations.length > 0) {
      console.log('\nViolations Details:');
      accessibilityScanResults.violations.forEach((violation) => {
        console.log(`\n- ${violation.id}: ${violation.description}`);
        console.log(`  Impact: ${violation.impact}`);
        console.log(`  Help: ${violation.helpUrl}`);
        console.log(`  Affected elements: ${violation.nodes.length}`);
      });
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
