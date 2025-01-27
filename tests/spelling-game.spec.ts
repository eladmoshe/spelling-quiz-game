import { test, expect } from '@playwright/test';

test.describe('Spelling Quiz Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to be fully rendered
    await page.waitForSelector('#app');
  });

  test('should load the game interface', async ({ page }) => {
    // Wait for and verify the title is visible
    await expect(page.locator('.title')).toBeVisible();
    
    // Wait for and verify essential game controls are present
    await expect(page.locator('#wordInput')).toBeVisible();
    await expect(page.locator('.btn-primary')).toBeVisible();
    await expect(page.locator('.lang-toggle')).toBeVisible();
  });

  test('should start a new game', async ({ page }) => {
    // Enter some words
    await page.locator('#wordInput').fill('hello,world');
    
    // Click the start button (using class since text is translated)
    await page.locator('.btn-primary').click();
    
    // Verify game elements are visible
    await expect(page.locator('#answerInput')).toBeVisible();
  });

  test('should handle correct answer submission', async ({ page }) => {
    // Start the game with a known word
    const testWord = 'test';
    await page.locator('#wordInput').fill(testWord);
    await page.locator('.btn-primary').click();
    
    // Wait for the game interface
    const answerInput = page.locator('#answerInput');
    await answerInput.waitFor();
    
    // Type the correct answer and submit
    await answerInput.fill(testWord);
    await page.keyboard.press('Enter');
    
    // For correct answers, the input should show the correct word
    await expect(answerInput).toHaveValue(testWord);
    
    // The word status dot should show as correct
    await expect(page.locator('.word-status-dot.correct')).toBeVisible();
  });

  test('should handle incorrect answer submission', async ({ page }) => {
    // Start the game with a known word
    const testWord = 'test';
    await page.locator('#wordInput').fill(testWord);
    await page.locator('.btn-primary').click();
    
    // Wait for the game interface
    const answerInput = page.locator('#answerInput');
    await answerInput.waitFor();
    
    // Type an incorrect answer and submit
    await answerInput.fill('tset');
    await page.keyboard.press('Enter');
    
    // For incorrect answers, check that the placeholder contains feedback
    await expect(answerInput).toHaveAttribute('placeholder', /.+/);
  });
});
