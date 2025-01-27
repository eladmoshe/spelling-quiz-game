/**
 * Interface defining the return type for word comparison
 */
interface WordComparisonResult {
  isCorrect: boolean;
  firstWrongLetter: number;
}

/**
 * A class that handles word comparison and provides feedback on spelling mistakes
 */
class WordMatcher {
  /**
   * Compares a user's answer with the correct word and provides feedback
   * @param {string} userAnswer - The user's attempted spelling
   * @param {string} correctWord - The correct spelling of the word
   * @returns {WordComparisonResult} Object containing whether the word is correct and the index of first wrong letter
   */
  checkWord(userAnswer: string, correctWord: string): WordComparisonResult {
    userAnswer = userAnswer.toLowerCase();
    correctWord = correctWord.toLowerCase();

    // If the words are identical, return success
    if (userAnswer === correctWord) {
      return {
        isCorrect: true,
        firstWrongLetter: -1,
      };
    }

    // Find the first difference between the words
    const minLength: number = Math.min(userAnswer.length, correctWord.length);
    for (let i = 0; i < minLength; i++) {
      if (userAnswer[i] !== correctWord[i]) {
        return {
          isCorrect: false,
          firstWrongLetter: i,
        };
      }
    }

    // If we get here, one word is a prefix of the other
    // The first wrong letter is at the length of the shorter word
    return {
      isCorrect: false,
      firstWrongLetter: minLength,
    };
  }
}

// Export the WordMatcher class
export default WordMatcher;
