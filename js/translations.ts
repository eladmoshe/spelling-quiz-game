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
    check: string;
    typePlaceholder: string;
    pressEnter: string;
    practiceComplete: string;
    greatJob: string;
    perfectWords: string;
    startOver: string;
    tryAgain: string;
    onlyEnglishLetters: string;
    patterns?: Pattern;
    switchToHebrew?: string;
    checkLetter?: string;
    attemptsMessage?: string;
    checkAnswer?: string;
    manualEntry: string;
    randomWords: string;
    selectMode: string;
}

interface Translations {
    en: Translation;
    he: Translation;
}

export const translations: Translations = {
    en: {
        title: 'Spelling Quiz',
        enterWords: 'Enter your own words',
        wordsPlaceholder: 'Enter words, one per line',
        instructions: 'Press space to hear the word, enter to check your answer',
        start: 'Start Practice',
        correct: 'Correct!',
        incorrect: 'Try again',
        next: 'Next Word',
        finish: 'Finish',
        summary: 'Practice Summary',
        totalWords: 'Total Words',
        attempts: 'Attempts',
        accuracy: 'Accuracy',
        retry: 'Retry',
        newWords: 'New Words',
        previousSets: 'Previous Word Sets',
        difficulty: 'Difficulty Level',
        easy: 'Easy (4-6 letters)',
        medium: 'Medium (7-9 letters)',
        hard: 'Hard (10+ letters)',
        wordCount: 'Number of Words',
        startPractice: 'Start Practice',
        word: 'Word',
        listen: 'Listen',
        check: 'Check',
        typePlaceholder: 'Type the word...',
        pressEnter: 'Press Enter to check',
        practiceComplete: 'Practice Complete! ',
        greatJob: 'Great job practicing your spelling!',
        perfectWords: 'Perfect Words',
        startOver: 'New Words',
        tryAgain: 'Try Again',
        onlyEnglishLetters: 'Only English letters allowed',
        patterns: {
            consonantBlends: "Consonant blends (like 'sh', 'th')",
            vowelPairs: "Vowel pairs",
            doubleLetters: "Double letters",
            singleVowels: "Single vowels"
        },
        switchToHebrew: 'עברית',
        checkLetter: 'Check Letter',
        attemptsMessage: 'It took {count} attempts',
        checkAnswer: 'Check Answer',
        manualEntry: 'Enter My Own Words',
        randomWords: 'Generate Random Words',
        selectMode: 'Select Mode'
    },
    he: {
        title: 'מבחן איות',
        enterWords: 'הכנס את המילים שלך',
        wordsPlaceholder: 'הכנס מילים, מילה בכל שורה',
        instructions: 'לחץ על רווח כדי לשמוע את המילה, אנטר כדי לבדוק את התשובה',
        start: 'התחל אימון',
        correct: 'נכון!',
        incorrect: 'נסה שוב',
        next: 'המילה הבאה',
        finish: 'סיים',
        summary: 'סיכום אימון',
        totalWords: 'סך הכל מילים',
        attempts: 'נסיונות',
        accuracy: 'דיוק',
        retry: 'נסה שוב',
        newWords: 'מילים חדשות',
        previousSets: 'סטים קודמים',
        difficulty: 'רמת קושי',
        easy: 'קל (4-6 אותיות)',
        medium: 'בינוני (7-9 אותיות)',
        hard: 'קשה (10+ אותיות)',
        wordCount: 'מספר מילים',
        startPractice: 'התחל אימון',
        word: 'מילה',
        listen: 'האזן',
        check: 'בדוק',
        typePlaceholder: 'הקלד את המילה...',
        pressEnter: 'הקש Enter לבדיקה',
        practiceComplete: 'התרגול הושלם! ',
        greatJob: 'כל הכבוד על תרגול האיות!',
        perfectWords: 'מילים מושלמות',
        startOver: 'מילים חדשות',
        tryAgain: 'נסה שוב',
        onlyEnglishLetters: 'רק אותיות באנגלית מותרות',
        patterns: {
            consonantBlends: "צירופי עיצורים (כמו 'sh', 'th')",
            vowelPairs: "זוגות תנועות",
            doubleLetters: "אותיות כפולות",
            singleVowels: "תנועות בודדות"
        },
        switchToHebrew: 'English',
        checkLetter: 'בדוק אות',
        attemptsMessage: 'לקח {count} נסיונות',
        checkAnswer: 'בדוק תשובה',
        manualEntry: 'הכנס מילים משלי',
        randomWords: 'צור מילים אקראיות',
        selectMode: 'בחר מצב'
    }
};
