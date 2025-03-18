/**
 * Interface defining the return type for word comparison
 */
interface WordComparisonResult {
  isCorrect: boolean;
  firstWrongLetter: number;
}

/**
 * A class that handles word comparison and identifies the first wrong letter
 */
class WordMatcher {
  /**
   * Compares a user's answer with the correct word and identifies the first wrong letter
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
        firstWrongLetter: -1
      };
    }

    // Find the first difference between the words
    const minLength = Math.min(userAnswer.length, correctWord.length);
    for (let i = 0; i < minLength; i++) {
      if (userAnswer[i] !== correctWord[i]) {
        return {
          isCorrect: false,
          firstWrongLetter: i
        };
      }
    }

    // If we get here, one word is a prefix of the other
    // If user's word is shorter, mark missing letter at the end
    // If user's word is longer, mark the extra letter
    return {
      isCorrect: false,
      firstWrongLetter: minLength
    };
  }
}

// Export the WordMatcher class
export default WordMatcher;
