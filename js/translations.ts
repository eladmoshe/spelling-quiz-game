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
    previousSets: string;
    patterns: {
        consonantBlends: string;
        vowelPairs: string;
        doubleLetters: string;
        singleVowels: string;
    };
    switchToHebrew: string;
    practiceComplete: string;
    startOver: string;
    checkLetter: string;
}

interface Translations {
    en: Translation;
    he: Translation;
}

export const translations: Translations = {
    en: {
        title: "Spelling Quiz",
        enterWords: "Enter words for practice (comma-separated)",
        wordsPlaceholder: "Example: cat, dog, house",
        instructions: "Enter your words separated by commas",
        start: "Start Practice",
        listen: "Listen",
        check: "Check",
        next: "Next",
        tryAgain: "Try Again",
        correct: "Correct!",
        previousSets: "Previous Sets",
        patterns: {
            consonantBlends: "Consonant blends (like 'sh', 'th')",
            vowelPairs: "Vowel pairs",
            doubleLetters: "Double letters",
            singleVowels: "Single vowels"
        },
        switchToHebrew: "עברית",
        practiceComplete: "Practice Complete!",
        startOver: "Start Over",
        checkLetter: "Check letter"
    },
    he: {
        title: "תרגול איות",
        enterWords: "הכנס מילים לתרגול (מופרדות בפסיקים)",
        wordsPlaceholder: "לדוגמה: cat, dog, house",
        instructions: "הכנס את המילים מופרדות בפסיקים",
        start: "התחל תרגול",
        listen: "האזן",
        check: "בדוק",
        next: "הבא",
        tryAgain: "נסה שוב",
        correct: "נכון!",
        previousSets: "רשימות קודמות",
        patterns: {
            consonantBlends: "צירופי עיצורים (כמו 'sh', 'th')",
            vowelPairs: "זוגות תנועות",
            doubleLetters: "אותיות כפולות",
            singleVowels: "תנועות בודדות"
        },
        switchToHebrew: "English",
        practiceComplete: "התרגול הושלם!",
        startOver: "התחל מחדש",
        checkLetter: "בדוק אות"
    }
};
