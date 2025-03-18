import { WordMatcher } from '../WordMatcher';

describe('WordMatcher', () => {
    let wordMatcher: WordMatcher;

    beforeEach(() => {
        wordMatcher = new WordMatcher();
    });

    describe('checkWord', () => {
        test('correct word returns isCorrect true and no wrong letter', () => {
            expect(wordMatcher.checkWord('driver', 'driver')).toEqual({
                isCorrect: true,
                firstWrongLetter: -1
            });
        });

        test('case insensitive comparison works', () => {
            expect(wordMatcher.checkWord('DrIvEr', 'dRiVeR')).toEqual({
                isCorrect: true,
                firstWrongLetter: -1
            });
        });

        test('identifies first wrong letter in middle of word', () => {
            expect(wordMatcher.checkWord('couw', 'cow')).toEqual({
                isCorrect: false,
                firstWrongLetter: 2
            });
        });

        test('identifies missing letter by returning word length', () => {
            expect(wordMatcher.checkWord('co', 'cow')).toEqual({
                isCorrect: false,
                firstWrongLetter: 2
            });
        });

        test('identifies wrong letter at start', () => {
            expect(wordMatcher.checkWord('bow', 'cow')).toEqual({
                isCorrect: false,
                firstWrongLetter: 0
            });
        });

        test('identifies extra letter at end', () => {
            expect(wordMatcher.checkWord('coww', 'cow')).toEqual({
                isCorrect: false,
                firstWrongLetter: 3
            });
        });

        test('empty user input returns first position as wrong', () => {
            expect(wordMatcher.checkWord('', 'test')).toEqual({
                isCorrect: false,
                firstWrongLetter: 0
            });
        });

        test('empty correct word returns first position as wrong', () => {
            expect(wordMatcher.checkWord('test', '')).toEqual({
                isCorrect: false,
                firstWrongLetter: 0
            });
        });

        test('both inputs empty returns correct result', () => {
            expect(wordMatcher.checkWord('', '')).toEqual({
                isCorrect: true,
                firstWrongLetter: -1
            });
        });

        test('identifies wrong letter in longer word', () => {
            expect(wordMatcher.checkWord('testing', 'test')).toEqual({
                isCorrect: false,
                firstWrongLetter: 4
            });
        });

        test('identifies first wrong letter in shorter word', () => {
            expect(wordMatcher.checkWord('tast', 'test')).toEqual({
                isCorrect: false,
                firstWrongLetter: 1
            });
        });

        test('identifies space as wrong letter', () => {
            expect(wordMatcher.checkWord('ice cream', 'icecream')).toEqual({
                isCorrect: false,
                firstWrongLetter: 3
            });
        });

        test('identifies wrong number as wrong letter', () => {
            expect(wordMatcher.checkWord('word123', 'word456')).toEqual({
                isCorrect: false,
                firstWrongLetter: 4
            });
        });

        test('identifies wrong special character', () => {
            expect(wordMatcher.checkWord('hello!', 'hello?')).toEqual({
                isCorrect: false,
                firstWrongLetter: 5
            });
        });

        test('identifies wrong unicode character', () => {
            expect(wordMatcher.checkWord('café', 'cafe')).toEqual({
                isCorrect: false,
                firstWrongLetter: 3
            });
        });

        test('identifies first wrong letter in very long word', () => {
            const longWord = 'pneumonoultramicroscopicsilicovolcanoconiosis';
            const wrongLongWord = 'pneumonoultramicroscopicsilicovolcanokoniosis';
            expect(wordMatcher.checkWord(wrongLongWord, longWord)).toEqual({
                isCorrect: false,
                firstWrongLetter: 37
            });
        });

        test('identifies first wrong letter with repeated characters', () => {
            expect(wordMatcher.checkWord('bookkeeper', 'bookeeper')).toEqual({
                isCorrect: false,
                firstWrongLetter: 4
            });
        });
    });

    describe('getNextLetterHint', () => {
        // Mock translations
        const mockTranslations = {
            en: {
                correct: 'Correct',
                incorrect: 'Incorrect'
            },
            he: {
                correct: 'נכון',
                incorrect: 'לא נכון'
            }
        };

        // Mock the translations import
        jest.mock('../../i18n/translations', () => ({
            translations: mockTranslations
        }));

        test('returns correct hint for correct word', () => {
            const hint = wordMatcher.getNextLetterHint('test', 'test', 'en');
            expect(hint.correct).toBe(true);
            expect(hint.wrongLetterPosition).toBe(-1);
        });

        test('returns incorrect hint with position for wrong word', () => {
            const hint = wordMatcher.getNextLetterHint('test', 'tast', 'en');
            expect(hint.correct).toBe(false);
            expect(hint.wrongLetterPosition).toBe(1);
            expect(hint.progress).toContain('text-red-500');
        });

        test('handles missing letter at end', () => {
            const hint = wordMatcher.getNextLetterHint('test', 'tes', 'en');
            expect(hint.correct).toBe(false);
            expect(hint.wrongLetterPosition).toBe(3);
            expect(hint.progress).toContain('text-red-500');
            expect(hint.progress).toContain('_');
        });

        test('correctly formats HTML for incorrect word', () => {
            const hint = wordMatcher.getNextLetterHint('spelling', 'speling', 'en');
            expect(hint.correct).toBe(false);
            expect(hint.progress).toContain('<span class="text-green-600">spel');
            expect(hint.progress).toContain('<span class="text-red-500">i');
            expect(hint.progress).toContain('<span class="text-gray-400">ng');
        });
    });
});
