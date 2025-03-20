import { test, expect } from '@playwright/test';

test.describe('Spelling Quiz Performance', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the page
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForSelector('#app', { state: 'visible', timeout: 10000 });
  });

  test('should handle a large list of words efficiently', async ({ page }) => {
    // Generate a large list of words (100 words)
    const largeWordList = Array.from({ length: 100 }, (_, i) => `word${i}`).join(',');
    
    // Record the start time
    const startTime = Date.now();
    
    // Enter the large word list with added delay for reliability
    await page.getByTestId('word-input').fill(largeWordList);
    await page.waitForTimeout(500); // Give the app more time to process the large input
    await page.getByTestId('start-button').click();
    
    // Wait for game board to appear
    await expect(page.getByTestId('answer-input')).toBeVisible({ timeout: 10000 });
    
    // Calculate loading time
    const loadTime = Date.now() - startTime;
    console.log(`Time to load 100 words: ${loadTime}ms`);
    
    // Check that word status indicators are rendered
    const wordStatusIndicators = page.locator('.word-status');
    await expect(wordStatusIndicators).toBeVisible();

    // Check that indicators are present (but don't check exact count as they may be virtualized)
    await expect(wordStatusIndicators.locator('.word-status-indicator').first()).toBeVisible();
    
    // Verify game is responsive by submitting first word
    await page.getByTestId('answer-input').fill('word0');
    
    const checkStartTime = Date.now();
    await page.getByTestId('check-button').click();

    // Verify next button appears within reasonable time
    await expect(page.getByTestId('next-button')).toBeVisible({ timeout: 5000 });

    const checkTime = Date.now() - checkStartTime;
    console.log(`Time to check answer: ${checkTime}ms`);
    
    // Expect check time to be under 1 second
    expect(checkTime).toBeLessThan(1000);
  });
  
  test('should handle rapid user interactions', async ({ page }) => {
    // Enter a small list of words with delay for reliability
    await page.getByTestId('word-input').fill('test1,test2,test3,test4,test5');
    await page.waitForTimeout(500); // Add a delay before starting the game
    await page.getByTestId('start-button').click();

    // Wait for game board (increased timeout for better reliability)
    await expect(page.getByTestId('answer-input')).toBeVisible({ timeout: 10000 });
    
    // Rapidly complete all words
    for (let i = 1; i <= 5; i++) {
      // Enter answer
      await page.getByTestId('answer-input').fill(`test${i}`);
      await page.getByTestId('check-button').click();

      // Wait for next button with increased timeout
      await expect(page.getByTestId('next-button')).toBeVisible({ timeout: 20000 });

      // Click next if not the last word
      if (i < 5) {
        await page.getByTestId('next-button').click();
        // Wait for answer input to be focused for next word
        await expect(page.getByTestId('answer-input')).toBeVisible();
        await expect(page.getByTestId('answer-input')).toHaveValue('');
      }
    }
    
    // Should reach summary page
    await page.getByTestId('next-button').click();
    await expect(page.locator('.summary-card')).toBeVisible({ timeout: 5000 });
  });
  
  test('should load and render previous word sets efficiently', async ({ page }) => {
    // First, create several word sets
    for (let i = 0; i < 5; i++) {
      // Enter a unique word set with delay for reliability
      await page.getByTestId('word-input').fill(`set${i}A,set${i}B,set${i}C`);
      await page.waitForTimeout(500); // Add a delay before starting the game
      await page.getByTestId('start-button').click();

      // Wait for game board with significantly increased timeout 
      await expect(page.getByTestId('answer-input')).toBeVisible({ timeout: 30000 });
      
      // Return to menu with wait before clicking
      await page.waitForTimeout(500); // Add a small delay before clicking the menu button
      await page.getByTestId('menu-button').click();

      // Wait for menu to appear with increased timeout
      await expect(page.getByTestId('start-button')).toBeVisible({ timeout: 10000 });
    }
    
    // Now check the performance of loading previous sets
    const startTime = Date.now();
    
    // Click on the first previous set
    const previousSetButtons = page.locator('.btn-outline[data-previous-set]');
    const firstSetButton = previousSetButtons.first();
    await firstSetButton.click();
    
    // Wait for game board
    await expect(page.getByTestId('answer-input')).toBeVisible({ timeout: 5000 });
    
    // Calculate loading time
    const loadTime = Date.now() - startTime;
    console.log(`Time to load previous set: ${loadTime}ms`);
    
    // Expect load time to be under 2 seconds
    expect(loadTime).toBeLessThan(2000);
  });
  
  test('should perform well with many attempts on the same word', async ({ page }) => {
    // Start a game with a single word
    await page.getByTestId('word-input').fill('difficult');
    await page.getByTestId('start-button').click();
    
    // Wait for game board
    await expect(page.getByTestId('answer-input')).toBeVisible({ timeout: 5000 });
    
    // Make many incorrect attempts
    const wrongAnswers = ['dificult', 'dificlt', 'diffcult', 'difiult', 'difficultt', 
                          'difficul', 'difcult', 'diffict', 'diffccult', 'dfficult'];
    
    for (const wrongAnswer of wrongAnswers) {
      await page.getByTestId('answer-input').fill(wrongAnswer);
      await page.getByTestId('check-button').click();
      
      // Wait for input to be cleared for next attempt
      await expect(page.getByTestId('answer-input')).toHaveValue('');
    }
    
    // Finally enter correct answer
    await page.getByTestId('answer-input').fill('difficult');
    
    const finalCheckStart = Date.now();
    await page.getByTestId('check-button').click();

    // Verify next button appears within reasonable time
    await expect(page.getByTestId('next-button')).toBeVisible({ timeout: 5000 });

    const finalCheckTime = Date.now() - finalCheckStart;
    console.log(`Time to check final answer after many attempts: ${finalCheckTime}ms`);
    
    // Expect check time to still be under 1 second
    expect(finalCheckTime).toBeLessThan(1000);
  });
});
