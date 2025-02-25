import { WordComparisonResult, WordHint } from '../models/WordModel';
import { translations } from '../i18n/translations';
import { Language } from '../models/GameState';

/**
 * A class that handles word comparison and identifies the first wrong letter
 */
export class WordMatcher {
  /**
   * Compares a user's answer with the correct word and identifies the first wrong letter
   * @param {string} correctWord - The correct spelling of the word
   * @param {string} userAnswer - The user's attempted spelling
   * @returns {WordComparisonResult} Object containing whether the word is correct and the index of first wrong letter
   */
  public checkWord(correctWord: string, userAnswer: string): WordComparisonResult {
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

  /**
   * Generates a hint based on user's answer
   * @param {string} correctWord - The correct word
   * @param {string} userAnswer - The user's attempt
   * @param {Language} language - Current language for translations
   * @returns {WordHint} Hint object with feedback and formatted progress display
   */
  public getNextLetterHint(correctWord: string, userAnswer: string, language: Language): WordHint {
    const t = translations[language];
    const result = this.checkWord(correctWord, userAnswer);

    if (result.isCorrect) {
      return {
        correct: true,
        message: t.correct,
        progress: correctWord,
        wrongLetterPosition: -1
      };
    }

    // Format the display string based on the first wrong letter
    let progress = '';
    if (result.firstWrongLetter === userAnswer.length) {
      // Missing letter at the end
      progress = `<span class="text-green-600">${userAnswer}</span><span class="text-red-500 font-bold">_</span>`;
    } else {
      // Show letters up to the wrong one in green, then mark wrong letter in red
      // and grey out the rest as unchecked
      progress = `<span class="text-green-600">${userAnswer.slice(0, result.firstWrongLetter)}</span>` +
          `<span class="text-red-500">${userAnswer[result.firstWrongLetter] || '_'}</span>` +
          (result.firstWrongLetter + 1 < userAnswer.length ?
              `<span class="text-gray-400">${userAnswer.slice(result.firstWrongLetter + 1)}</span>` : '');
    }

    return {
      correct: false,
      message: t.incorrect,
      progress,
      wrongLetterPosition: result.firstWrongLetter
    };
  }
}

export default WordMatcher;