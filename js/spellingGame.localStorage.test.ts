import { test, expect } from '@playwright/test';

test.describe('SpellingGame localStorage Behavior', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the app and reset localStorage
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.clear();
        });
    });

    test('localStorage maintains incorrect word and clears on correct word', async ({ page }) => {
        // Wait for the game to load
        await page.waitForSelector('#answerInput');

        // Get the current word
        const currentWord = await page.evaluate(() => {
            return (window as any).game.wordList[0];
        });

        // Enter an incorrect word
        const incorrectWord = currentWord + 'x';
        await page.fill('#answerInput', incorrectWord);

        // Click check button
        await page.click('#checkButton');

        // Verify the word is saved in localStorage
        const storedWord = await page.evaluate(() => {
            return localStorage.getItem('currentWord');
        });
        expect(storedWord).toBe(incorrectWord);

        // Now enter the correct word
        await page.fill('#answerInput', currentWord);
        await page.click('#checkButton');

        // Verify localStorage is cleared after correct word
        const clearedStoredWord = await page.evaluate(() => {
            return localStorage.getItem('currentWord');
        });
        expect(clearedStoredWord).toBeNull();

        // Verify next word is loaded
        const nextWordIndex = await page.evaluate(() => {
            return (window as any).game.currentIndex;
        });
        expect(nextWordIndex).toBe(1);
    });
});
