interface Pattern {
    consonantBlends: string;
    vowelPairs: string;
    doubleLetters: string;
    singleVowels: string;
}

interface Translation {
    title: string;
    enterWords: string;
    wordsPlaceholder: string;
    instructions: string;
    start: string;
    listen: string;
    check: string;
    next: string;
    tryAgain: string;
    correct: string;
    incorrect: string;
    previousSets: string;
    patterns: Pattern;
    switchToHebrew: string;
    practiceComplete: string;
    startOver: string;
    checkLetter: string;
    typePlaceholder: string;
    pressEnter: string;
    attemptsMessage: string;
    checkAnswer: string;
    greatJob: string;
    totalWords: string;
    perfectWords: string;
    accuracy: string;
    showMistakes: string;
    onlyEnglishLetters: string;
}

interface Translations {
    en: Translation;
    he: Translation;
}

export const translations: Translations = {
    en: {
        title: 'Spelling Quiz',
        enterWords: 'Enter words to practice',
        wordsPlaceholder: 'Type or paste words, separated by commas',
        instructions: 'Enter multiple words separated by commas',
        start: 'Start Practice',
        check: 'Check',
        next: 'Next',
        correct: 'Correct!',
        incorrect: 'Try again',
        listen: 'Listen',
        typePlaceholder: 'Type the word...',
        pressEnter: 'Press Enter to check',
        previousSets: 'Previous Sets',
        attemptsMessage: 'It took {count} attempts',
        practiceComplete: 'Practice Complete! 🌟',
        greatJob: 'Great job practicing your spelling!',
        totalWords: 'Total Words',
        perfectWords: 'Perfect Words',
        accuracy: 'Accuracy',
        startOver: 'Practice New Words',
        tryAgain: 'Try Again',
        switchToHebrew: 'עברית',
        checkLetter: 'Check Letter',
        checkAnswer: 'Check Answer',
        patterns: {
            consonantBlends: "Consonant blends (like 'sh', 'th')",
            vowelPairs: "Vowel pairs",
            doubleLetters: "Double letters",
            singleVowels: "Single vowels"
        },
        showMistakes: 'Show Mistakes Report',
        onlyEnglishLetters: 'Only English letters allowed'
    },
    he: {
        title: 'תרגול איות',
        enterWords: 'הכנס מילים לתרגול',
        wordsPlaceholder: 'הקלד או הדבק מילים, מופרדות בפסיקים',
        instructions: 'הכנס מספר מילים מופרדות בפסיקים',
        start: 'התחל תרגול',
        check: 'בדוק',
        next: 'הבא',
        correct: 'נכון!',
        incorrect: 'נסה שוב',
        listen: 'האזן',
        typePlaceholder: 'הקלד את המילה...',
        pressEnter: 'הקש Enter לבדיקה',
        previousSets: 'סטים קודמים',
        attemptsMessage: 'לקח {count} נסיונות',
        practiceComplete: 'התרגול הושלם! 🌟',
        greatJob: 'כל הכבוד על תרגול האיות!',
        totalWords: 'סך הכל מילים',
        perfectWords: 'מילים מושלמות',
        accuracy: 'דיוק',
        startOver: 'תרגל מילים חדשות',
        tryAgain: 'נסה שוב',
        switchToHebrew: 'English',
        checkLetter: 'בדוק אות',
        checkAnswer: 'בדוק תשובה',
        patterns: {
            consonantBlends: "צירופי עיצורים (כמו 'sh', 'th')",
            vowelPairs: "זוגות תנועות",
            doubleLetters: "אותיות כפולות",
            singleVowels: "תנועות בודדות"
        },
        showMistakes: 'הצג דוח טעויות',
        onlyEnglishLetters: 'רק אותיות באנגלית מותרות'
    }
};
