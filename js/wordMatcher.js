/**
 * A class that handles word comparison and provides detailed feedback on spelling mistakes
 */
class WordMatcher {
    /**
     * Compares a user's answer with the correct word and provides detailed feedback
     * @param {string} userAnswer - The user's attempted spelling
     * @param {string} correctWord - The correct spelling of the word
     * @returns {Array<{char: string, status: 'correct'|'wrong'|'missing', type: 'match'|'extra'|'missing', correctChar?: string}>}
     */
    compareWords(userAnswer, correctWord) {
        userAnswer = userAnswer.toLowerCase();
        correctWord = correctWord.toLowerCase();
        
        const lcs = this.#longestCommonSubsequence(userAnswer, correctWord);
        
        let result = [];
        let i = 0;  // index in userAnswer
        let j = 0;  // index in correctWord
        let k = 0;  // index in lcs
        
        while (j < correctWord.length) {
            if (k < lcs.length && i < userAnswer.length && 
                userAnswer[i] === lcs[k] && 
                correctWord[j] === lcs[k]) {
                // Matching character from LCS
                result.push({
                    char: userAnswer[i],
                    status: 'correct',
                    type: 'match'
                });
                i++;
                j++;
                k++;
            } else if (i < userAnswer.length && userAnswer[i] === correctWord[j]) {
                // Matching character not in LCS
                result.push({
                    char: userAnswer[i],
                    status: 'correct',
                    type: 'match'
                });
                i++;
                j++;
            } else if (i < userAnswer.length && 
                     k < lcs.length && 
                     userAnswer[i] === lcs[k]) {
                // Extra character in user answer
                result.push({
                    char: userAnswer[i],
                    status: 'wrong',
                    type: 'extra'
                });
                i++;
            } else {
                // Missing character in user answer
                result.push({
                    char: '_',
                    status: 'missing',
                    correctChar: correctWord[j],
                    type: 'missing'
                });
                j++;
            }
        }
        
        // Add any remaining extra characters from user answer
        while (i < userAnswer.length) {
            result.push({
                char: userAnswer[i],
                status: 'wrong',
                type: 'extra'
            });
            i++;
        }
        
        return result;
    }

    /**
     * Finds the longest common subsequence between two strings
     * @private
     * @param {string} str1 - First string to compare
     * @param {string} str2 - Second string to compare
     * @returns {string} The longest common subsequence
     */
    #longestCommonSubsequence(str1, str2) {
        const m = str1.length;
        const n = str2.length;
        const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
        const backtrack = Array(m + 1).fill().map(() => Array(n + 1).fill(''));
        
        // Fill the dp table
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (str1[i - 1] === str2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                    backtrack[i][j] = 'diag';
                } else if (dp[i - 1][j] >= dp[i][j - 1]) {
                    dp[i][j] = dp[i - 1][j];
                    backtrack[i][j] = 'up';
                } else {
                    dp[i][j] = dp[i][j - 1];
                    backtrack[i][j] = 'left';
                }
            }
        }
        
        // Reconstruct the LCS
        let lcs = '';
        let i = m, j = n;
        while (i > 0 && j > 0) {
            if (backtrack[i][j] === 'diag') {
                lcs = str1[i - 1] + lcs;
                i--;
                j--;
            } else if (backtrack[i][j] === 'up') {
                i--;
            } else {
                j--;
            }
        }
        
        return lcs;
    }

    /**
     * Finds the next matching character position in the correct word slice
     * @param {string} userSlice - A slice of the user's answer
     * @param {string} correctSlice - A slice of the correct word
     * @returns {number} The index of the next match, or -1 if no match found
     */
    findNextMatch(userSlice, correctSlice) {
        if (!userSlice || !correctSlice) return -1;
        for (let i = 0; i < correctSlice.length; i++) {
            if (userSlice[0] === correctSlice[i]) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Get a hint for the user's answer
     * @param {string} userAnswer - The user's attempted spelling
     * @param {string} correctWord - The correct spelling
     * @returns {Object} Object containing:
     *   - word: the user's input
     *   - redLetters: array of letters that should be shown in red (wrong or extra)
     *   - underscorePositions: array of positions where underscores should be shown (first missing letter)
     */
    getHint(userAnswer, correctWord) {
        const redLetters = new Set();
        const underscorePositions = new Set();
        let foundFirstMissing = false;
        
        // Count letters in correct word
        const correctLetterCount = new Map();
        for (const char of correctWord) {
            correctLetterCount.set(char, (correctLetterCount.get(char) || 0) + 1);
        }
        
        // Track used letters
        const usedLetters = new Map();
        
        // First pass: Handle matching letters
        for (let i = 0; i < Math.min(userAnswer.length, correctWord.length); i++) {
            const userLetter = userAnswer[i];
            const correctLetter = correctWord[i];
            
            if (userLetter === correctLetter) {
                usedLetters.set(userLetter, (usedLetters.get(userLetter) || 0) + 1);
            }
        }
        
        // Second pass: Handle non-matching letters
        for (let i = 0; i < Math.max(userAnswer.length, correctWord.length); i++) {
            const userLetter = userAnswer[i];
            const correctLetter = correctWord[i];
            
            if (i >= correctWord.length) {
                // Extra letter at end
                redLetters.add(userLetter);
                continue;
            }
            
            if (i >= userAnswer.length) {
                // Missing letter at end
                if (!foundFirstMissing) {
                    underscorePositions.add(i);
                    foundFirstMissing = true;
                }
                continue;
            }
            
            if (userLetter !== correctLetter) {
                const remainingCount = (correctLetterCount.get(userLetter) || 0) - (usedLetters.get(userLetter) || 0);
                
                if (remainingCount <= 0) {
                    // Letter is either wrong or extra
                    redLetters.add(userLetter);
                } else if (!foundFirstMissing) {
                    // Letter exists but in wrong position - show underscore
                    underscorePositions.add(i);
                    foundFirstMissing = true;
                }
                
                // Update used count
                usedLetters.set(userLetter, (usedLetters.get(userLetter) || 0) + 1);
            }
        }
        
        return {
            word: userAnswer,
            redLetters: Array.from(redLetters),
            underscorePositions: Array.from(underscorePositions)
        };
    }
}

// Export the WordMatcher class
export default WordMatcher;
