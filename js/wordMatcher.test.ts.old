import WordMatcher from './wordMatcher';

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
});
