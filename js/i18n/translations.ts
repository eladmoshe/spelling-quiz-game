export interface Pattern {
  consonantBlends: string;
  vowelPairs: string;
  doubleLetters: string;
  singleVowels: string;
}

export interface Translation {
  title: string;
  enterWords: string;
  wordsPlaceholder: string;
  instructions: string;
  start: string;
  correct: string;
  incorrect: string;
  next: string;
  finish: string;
  summary: string;
  totalWords: string;
  attempts: string;
  accuracy: string;
  retry: string;
  newWords: string;
  previousSets: string;
  difficulty: string;
  easy: string;
  medium: string;
  hard: string;
  wordCount: string;
  startPractice: string;
  word: string;
  listen: string;
  listenSlower: string;
  check: string;
  typePlaceholder: string;
  pressEnter: string;
  practiceComplete: string;
  greatJob: string;
  perfectWords: string;
  startOver: string;
  tryAgain: string;
  onlyEnglishLetters: string;
  feedbackLegend: string;
  correctLetters: string;
  wrongLetter: string;
  uncheckedLetters: string;
  switchToHebrew?: string;
  checkLetter?: string;
  attemptsMessage?: string;
  checkAnswer?: string;
  manualEntry: string;
  randomWords: string;
  selectMode: string;
  patterns?: Pattern;
  wordAttemptBreakdown: string;
  sendFeedback: string;
}

export interface Translations {
  en: Translation;
  he: Translation;
}

export const translations: Translations = {
  en: {
    title: 'Spelling Quiz',
    enterWords: 'Enter words to practice (one per line or comma-separated)',
    wordsPlaceholder: 'Enter words here...',
    instructions: 'Practice your spelling skills with words of your choice.',
    start: 'Start',
    correct: 'Correct!',
    incorrect: 'Try again',
    next: 'Next word',
    finish: 'Finish',
    summary: 'Summary',
    totalWords: 'Total Words',
    attempts: 'Attempts',
    accuracy: 'Accuracy',
    retry: 'Try Again',
    newWords: 'New Words',
    previousSets: 'Previous Word Sets',
    difficulty: 'Difficulty',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    wordCount: 'Number of Words',
    startPractice: 'Start Practice',
    word: 'Word',
    listen: 'Listen',
    listenSlower: 'Listen Slower',
    check: 'Check',
    typePlaceholder: 'Type the word...',
    pressEnter: 'Press Enter to check',
    practiceComplete: 'Practice Complete!',
    greatJob: 'Great job! Here are your results:',
    perfectWords: 'Perfect Words',
    startOver: 'New Words',
    tryAgain: 'Try Again',
    onlyEnglishLetters: 'Please enter only English letters',
    feedbackLegend: 'Feedback Guide:',
    correctLetters: 'Correct letters',
    wrongLetter: 'First mistake',
    uncheckedLetters: 'Not checked yet',
    switchToHebrew: 'עברית',
    checkLetter: 'Check Letter',
    attemptsMessage: 'It took {count} attempts',
    checkAnswer: 'Check Answer',
    manualEntry: 'Enter Words',
    randomWords: 'Random Words',
    selectMode: 'Select Mode',
    wordAttemptBreakdown: 'Word Attempt Breakdown',
    sendFeedback: 'Send Feedback',
    patterns: {
      consonantBlends: "Consonant blends (like 'sh', 'th')",
      vowelPairs: "Vowel pairs",
      doubleLetters: "Double letters",
      singleVowels: "Single vowels"
    }
  },
  he: {
    title: 'תרגול כתיב',
    enterWords: 'הכנס מילים לתרגול (מילה בכל שורה או מופרדות בפסיקים)',
    wordsPlaceholder: 'הכנס מילים כאן...',
    instructions: 'תרגל את מיומנויות האיות שלך עם מילים לבחירתך.',
    start: 'התחל',
    correct: 'נכון!',
    incorrect: 'נסה שוב',
    next: 'המילה הבאה',
    finish: 'סיים',
    summary: 'סיכום',
    totalWords: 'סך הכל מילים',
    attempts: 'נסיונות',
    accuracy: 'דיוק',
    retry: 'נסה שוב',
    newWords: 'מילים חדשות',
    previousSets: 'סטים קודמים',
    difficulty: 'רמת קושי',
    easy: 'קל',
    medium: 'בינוני',
    hard: 'קשה',
    wordCount: 'מספר מילים',
    startPractice: 'התחל תרגול',
    word: 'מילה',
    listen: 'האזן',
    listenSlower: 'האזן לאט יותר',
    check: 'בדוק',
    typePlaceholder: 'הקלד את המילה...',
    pressEnter: 'הקש Enter לבדיקה',
    practiceComplete: 'התרגול הושלם!',
    greatJob: 'כל הכבוד! הנה התוצאות שלך:',
    perfectWords: 'מילים מושלמות',
    startOver: 'מילים חדשות',
    tryAgain: 'נסה שוב',
    onlyEnglishLetters: 'אנא הכנס רק אותיות באנגלית',
    feedbackLegend: 'מדריך משוב:',
    correctLetters: 'אותיות נכונות',
    wrongLetter: 'טעות ראשונה',
    uncheckedLetters: 'טרם נבדק',
    switchToHebrew: 'English',
    checkLetter: 'בדוק אות',
    attemptsMessage: 'לקח {count} נסיונות',
    checkAnswer: 'בדוק תשובה',
    manualEntry: 'הכנס מילים',
    randomWords: 'מילים אקראיות',
    selectMode: 'בחר מצב',
    wordAttemptBreakdown: 'פירוט נסיונות למילים',
    sendFeedback: 'שלח משוב',
    patterns: {
      consonantBlends: "צירופי עיצורים (כמו 'sh', 'th')",
      vowelPairs: "זוגות תנועות",
      doubleLetters: "אותיות כפולות",
      singleVowels: "תנועות בודדות"
    }
  }
};