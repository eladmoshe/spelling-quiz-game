import { translations } from './translations';

describe('translations', () => {
    describe('structure', () => {
        test('has english and hebrew translations', () => {
            expect(translations).toHaveProperty('en');
            expect(translations).toHaveProperty('he');
        });

        test('english translation has all required fields', () => {
            const requiredFields = [
                'title',
                'enterWords',
                'wordsPlaceholder',
                'instructions',
                'start',
                'correct',
                'incorrect',
                'next',
                'finish',
                'summary',
                'totalWords',
                'attempts',
                'accuracy',
                'retry',
                'newWords',
                'previousSets',
                'difficulty',
                'easy',
                'medium',
                'hard',
                'wordCount',
                'startPractice',
                'word',
                'listen',
                'check',
                'typePlaceholder',
                'pressEnter',
                'practiceComplete',
                'greatJob',
                'perfectWords',
                'startOver',
                'tryAgain',
                'onlyEnglishLetters',
                'feedbackLegend',
                'correctLetters',
                'wrongLetter',
                'uncheckedLetters',
                'manualEntry',
                'randomWords',
                'selectMode'
            ] as const;

            requiredFields.forEach(field => {
                expect(translations.en).toHaveProperty(field);
                expect(typeof translations.en[field]).toBe('string');
            });
        });

        test('hebrew translation has all required fields', () => {
            const requiredFields = [
                'title',
                'enterWords',
                'wordsPlaceholder',
                'instructions',
                'start',
                'correct',
                'incorrect',
                'next',
                'finish',
                'summary',
                'totalWords',
                'attempts',
                'accuracy',
                'retry',
                'newWords',
                'previousSets',
                'difficulty',
                'easy',
                'medium',
                'hard',
                'wordCount',
                'startPractice',
                'word',
                'listen',
                'check',
                'typePlaceholder',
                'pressEnter',
                'practiceComplete',
                'greatJob',
                'perfectWords',
                'startOver',
                'tryAgain',
                'onlyEnglishLetters',
                'feedbackLegend',
                'correctLetters',
                'wrongLetter',
                'uncheckedLetters',
                'manualEntry',
                'randomWords',
                'selectMode'
            ] as const;

            requiredFields.forEach(field => {
                expect(translations.he).toHaveProperty(field);
                expect(typeof translations.he[field]).toBe('string');
            });
        });

        test('english translation has patterns object with all required fields', () => {
            expect(translations.en.patterns).toBeDefined();
            const patterns = translations.en.patterns!;
            expect(patterns).toHaveProperty('consonantBlends');
            expect(patterns).toHaveProperty('vowelPairs');
            expect(patterns).toHaveProperty('doubleLetters');
            expect(patterns).toHaveProperty('singleVowels');
        });

        test('hebrew translation has patterns object with all required fields', () => {
            expect(translations.he.patterns).toBeDefined();
            const patterns = translations.he.patterns!;
            expect(patterns).toHaveProperty('consonantBlends');
            expect(patterns).toHaveProperty('vowelPairs');
            expect(patterns).toHaveProperty('doubleLetters');
            expect(patterns).toHaveProperty('singleVowels');
        });
    });

    describe('content', () => {
        test('english title is "Spelling Quiz"', () => {
            expect(translations.en.title).toBe('Spelling Quiz');
        });

        test('hebrew title is "תרגול כתיב"', () => {
            expect(translations.he.title).toBe('תרגול כתיב');
        });

        test('language toggle buttons show correct text', () => {
            expect(translations.en.switchToHebrew).toBe('עברית');
            expect(translations.he.switchToHebrew).toBe('English');
        });
    });
});
