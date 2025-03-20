import { test, expect } from '@playwright/test';

test.describe('Spelling Quiz Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the page
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForSelector('#app', { state: 'visible', timeout: 10000 });
  });

  test('should handle empty word input gracefully', async ({ page }) => {
    // Try to start a game with empty input
    await page.getByTestId('start-button').click();
    
    // Should display an error message
    await expect(page.locator('.text-red-500')).toBeVisible({ timeout: 5000 });
    
    // Verify we're still on the menu screen
    await expect(page.getByTestId('start-button')).toBeVisible();
  });
  
  test('should handle special characters in input', async ({ page }) => {
    // Enter words with special characters
    await page.getByTestId('word-input').fill('café,naïve,résumé');

    // Add a delay before starting the game
    await page.waitForTimeout(500);

    // Start the game
    await page.getByTestId('start-button').click();

    // Verify game started (increased timeout for better reliability)
    await expect(page.getByTestId('answer-input')).toBeVisible({ timeout: 10000 });
    
    // Enter a special character answer
    await page.getByTestId('answer-input').fill('café');
    await page.keyboard.press('Enter');
    
    // Should handle it properly (either correct or showing appropriate feedback)
    await expect(page.getByTestId('check-button').or(page.getByTestId('next-word-button'))).toBeVisible();
  });
  
  test('should be accessible via keyboard navigation', async ({ page }) => {
    // Use keyboard to navigate
    await page.keyboard.press('Tab'); // Focus on language toggle
    await page.keyboard.press('Tab'); // Focus on manual mode button
    await page.keyboard.press('Tab'); // Focus on random mode button
    await page.keyboard.press('Tab'); // Focus on word input

    // Enter some text using keyboard
    await page.keyboard.type('apple');

    // Tab to start button and press it
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500); // Add a delay before starting the game
    await page.keyboard.press('Enter');

    // Verify game started (increased timeout for better reliability)
    await expect(page.getByTestId('answer-input')).toBeVisible({ timeout: 10000 });
    
    // Type answer using keyboard
    await page.keyboard.type('apple');
    await page.keyboard.press('Enter');
    
    // Tab to next word button and press it
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Verify next word is shown with increased timeouts
    await expect(page.getByTestId('answer-input')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('answer-input')).toHaveValue('', { timeout: 10000 });
  });
  
  test('should handle spamming the check button', async ({ page }) => {
    // Start a game
    await page.getByTestId('word-input').fill('test');
    await page.getByTestId('start-button').click();

    // Wait for game to start (increased timeout for better reliability)
    await expect(page.getByTestId('answer-input')).toBeVisible({ timeout: 10000 });
    
    // Enter partial answer
    await page.getByTestId('answer-input').fill('te');
    
    // Spam the check button
    for (let i = 0; i < 10; i++) {
      await page.getByTestId('check-button').click({ force: true });
    }
    
    // Should still be on the same word, not crashed
    await expect(page.getByTestId('answer-input')).toBeVisible();
  });
  
  test('should handle rapid language switching', async ({ page }) => {
    // Rapidly toggle language multiple times
    for (let i = 0; i < 5; i++) {
      await page.getByTestId('language-toggle').click();
      // Small wait to ensure click registers
      await page.waitForTimeout(100);
    }

    // Interface should still be usable
    await page.getByTestId('word-input').fill('test');
    await page.getByTestId('start-button').click();

    // Verify game started (increased timeout for better reliability)
    await expect(page.getByTestId('answer-input')).toBeVisible({ timeout: 10000 });
  });
  
  test('should recover from reload during game', async ({ page }) => {
    // Start a game
    await page.getByTestId('word-input').fill('apple,banana');
    await page.getByTestId('start-button').click();

    // Wait for game to start (increased timeout for better reliability)
    await expect(page.getByTestId('answer-input')).toBeVisible({ timeout: 10000 });
    
    // Enter correct answer for first word
    await page.getByTestId('answer-input').fill('apple');
    await page.keyboard.press('Enter');
    
    // Wait for next button and click it
    await expect(page.getByTestId('next-button')).toBeVisible();
    await page.getByTestId('next-button').click();
    
    // Now reload the page during the second word
    await page.reload();
    await page.waitForSelector('#app', { state: 'visible', timeout: 10000 });
    
    // Should be back at the menu, but previous set should be available
    await expect(page.getByTestId('start-button')).toBeVisible();
    
    // Our word set should be visible in previous sets
    const previousSetButton = page.getByRole('button', { name: 'apple, banana' });
    await expect(previousSetButton).toBeVisible({ timeout: 10000 });
  });
  
  test('should handle network speech synthesis error', async ({ page }) => {
    // Start a game
    await page.getByTestId('word-input').fill('test');
    await page.getByTestId('start-button').click();

    // Wait for game to start (increased timeout for better reliability)
    await expect(page.getByTestId('answer-input')).toBeVisible({ timeout: 10000 });
    
    // Mock a network error for speech synthesis
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (url.includes('cognitiveservices') || url.includes('speech')) {
        return route.abort('internetdisconnected');
      }
      return route.continue();
    });
    
    // Try to play the word
    await page.getByTestId('play-button').click();
    
    // Game should not crash, still be usable
    await page.getByTestId('answer-input').fill('test');
    await page.keyboard.press('Enter');
    
    // Should still be able to progress
    await expect(page.getByTestId('next-button')).toBeVisible({ timeout: 5000 });
  });
});
