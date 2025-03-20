import { test, expect } from '@playwright/test';

test.describe('Spelling Quiz Localization', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the page
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForSelector('#app', { state: 'visible', timeout: 10000 });
  });

  test('should display English UI elements correctly', async ({ page }) => {
    // Ensure English language is set
    const languageToggle = page.getByTestId('language-toggle');
    const toggleText = await languageToggle.textContent();
    
    if (toggleText?.includes('English')) {
      // Already in Hebrew, click to switch to English
      await languageToggle.click();
      await page.waitForTimeout(500);
    }
    
    // Check English UI elements
    await expect(page.getByTestId('game-title')).toBeVisible();
    
    // Verify document direction
    const dir = await page.evaluate(() => document.dir);
    expect(dir).toBe('ltr');
    
    // Check specific English text 
    const startButton = page.getByTestId('start-button');
    expect(await startButton.textContent()).toContain('Start');
  });
  
  test('should display Hebrew UI elements correctly', async ({ page }) => {
    // Ensure Hebrew language is set
    const languageToggle = page.getByTestId('language-toggle');
    const toggleText = await languageToggle.textContent();
    
    if (toggleText?.includes('עברית')) {
      // Already in English, click to switch to Hebrew
      await languageToggle.click();
      await page.waitForTimeout(500);
    }
    
    // Check Hebrew UI elements
    await expect(page.getByTestId('game-title')).toBeVisible();
    
    // Verify document direction
    const dir = await page.evaluate(() => document.dir);
    expect(dir).toBe('rtl');
    
    // Start a game to test more UI elements
    await page.getByTestId('word-input').fill('test');
    await page.getByTestId('start-button').click();
    
    // Wait for game board
    await expect(page.getByTestId('answer-input')).toBeVisible({ timeout: 5000 });
    
    // Check play button text in Hebrew
    const playButton = page.getByTestId('play-word-button');
    expect(await playButton.getAttribute('aria-label')).toBeTruthy();
  });
  
  test('should persist language across game screens', async ({ page }) => {
    // Ensure Hebrew language is set
    const languageToggle = page.getByTestId('language-toggle');
    const toggleText = await languageToggle.textContent();
    
    if (toggleText?.includes('עברית')) {
      // Already in English, click to switch to Hebrew
      await languageToggle.click();
      await page.waitForTimeout(500);
    }
    
    // Get UI direction
    const initialDir = await page.evaluate(() => document.dir);
    
    // Start a game
    await page.getByTestId('word-input').fill('test');
    await page.getByTestId('start-button').click();
    
    // Wait for game board
    await expect(page.getByTestId('answer-input')).toBeVisible({ timeout: 5000 });
    
    // Check if direction is preserved
    const gameScreenDir = await page.evaluate(() => document.dir);
    expect(gameScreenDir).toBe(initialDir);
    
    // Complete the game
    await page.getByTestId('answer-input').fill('test');
    await page.keyboard.press('Enter');
    
    // Go to summary screen
    await page.getByTestId('next-word-button').click();
    
    // Wait for summary screen
    await page.waitForSelector('.summary-card', { state: 'visible', timeout: 5000 });
    
    // Check if direction is still preserved
    const summaryScreenDir = await page.evaluate(() => document.dir);
    expect(summaryScreenDir).toBe(initialDir);
  });
  
  test('should handle right-to-left text input correctly', async ({ page }) => {
    // Ensure Hebrew language is set
    const languageToggle = page.getByTestId('language-toggle');
    const toggleText = await languageToggle.textContent();
    
    if (toggleText?.includes('עברית')) {
      // Already in English, click to switch to Hebrew
      await languageToggle.click();
      await page.waitForTimeout(500);
    }
    
    // Enter mixed English and Hebrew words
    await page.getByTestId('word-input').fill('test,שלום');
    await page.getByTestId('start-button').click();
    
    // Wait for game board
    await expect(page.getByTestId('answer-input')).toBeVisible({ timeout: 5000 });
    
    // The game should handle the first word
    await page.getByTestId('answer-input').fill('test');
    await page.keyboard.press('Enter');
    
    // Should be able to proceed
    await expect(page.getByTestId('next-word-button')).toBeVisible();
  });
  
  test('should maintain language setting after page reload', async ({ page }) => {
    // Ensure Hebrew language is set
    const languageToggle = page.getByTestId('language-toggle');
    const toggleText = await languageToggle.textContent();
    
    if (toggleText?.includes('עברית')) {
      // Already in English, click to switch to Hebrew
      await languageToggle.click();
      await page.waitForTimeout(500);
    }
    
    // Get current direction
    const initialDir = await page.evaluate(() => document.dir);
    
    // Reload the page
    await page.reload();
    await page.waitForSelector('#app', { state: 'visible', timeout: 10000 });
    
    // Check if direction is preserved
    const reloadedDir = await page.evaluate(() => document.dir);
    expect(reloadedDir).toBe(initialDir);
  });
});
