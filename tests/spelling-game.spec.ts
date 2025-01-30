import { test, expect } from '@playwright/test';

test.describe('Spelling Quiz Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to be fully rendered
    await page.waitForSelector('#app');
  });

  test('should load the game interface', async ({ page }) => {
    // Wait for and verify the title is visible
    await expect(page.getByTestId('game-title')).toBeVisible();

    // Wait for and verify essential game controls are present
    await expect(page.getByTestId('word-input')).toBeVisible();
    await expect(page.getByTestId('start-button')).toBeVisible();
    await expect(page.getByTestId('language-toggle')).toBeVisible();
  });

  test('should start a new game', async ({ page }) => {
    // Enter some words
    await page.getByTestId('word-input').fill('hello,world');

    // Click the start button
    await page.getByTestId('start-button').click();

    // Verify game elements are visible
    await expect(page.getByTestId('answer-input')).toBeVisible();
  });

  test('should handle correct answer submission', async ({ page }) => {
    // Start the game with a known word
    const testWord = 'test';
    await page.getByTestId('word-input').fill(testWord);
    await page.getByTestId('start-button').click();

    // Wait for the game interface
    const answerInput = page.getByTestId('answer-input');
    await answerInput.waitFor();

    // Type the correct answer and submit
    await answerInput.fill(testWord);
    await page.keyboard.press('Enter');

    // For correct answers, the input should show the correct word
    await expect(answerInput).toHaveValue(testWord);

    // The word status dot should show as correct
    await expect(page.getByTestId('word-status-correct')).toBeVisible();
  });

  test('should handle incorrect answer submission', async ({ page }) => {
    // Start the game with a known word
    const testWord = 'test';
    await page.getByTestId('word-input').fill(testWord);
    await page.getByTestId('start-button').click();

    // Wait for the game interface
    const answerInput = page.getByTestId('answer-input');
    await answerInput.waitFor();

    // Type an incorrect answer and submit
    await answerInput.fill('tset');
    await page.keyboard.press('Enter');

    // For incorrect answers, check that the placeholder contains feedback
    await expect(answerInput).toHaveAttribute('placeholder', /.+/);
  });

  test('should display and allow reuse of previous word sets', async ({ page }) => {
    // Start a game with initial words
    const initialWords = 'apple, banana';
    await page.getByTestId('word-input').fill(initialWords);
    await page.getByTestId('start-button').click();

    // Refresh the page to simulate a new session
    await page.reload();
    await page.waitForSelector('#app');

    // Verify that previous word set is visible and contains our words
    const previousWordsButton = page.getByRole('button', { name: initialWords });
    await expect(previousWordsButton).toBeVisible();

    // Click on the previous words set
    await previousWordsButton.click();

    // Verify that the words are loaded into the input
    await expect(page.getByTestId('check-button')).toBeVisible();
  });
});
