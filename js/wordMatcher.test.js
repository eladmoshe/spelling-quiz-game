import WordMatcher from './wordMatcher.js';

describe('WordMatcher', () => {
    let wordMatcher;

    beforeEach(() => {
        wordMatcher = new WordMatcher();
    });

    describe('checkWord', () => {
        test('correct spelling returns isCorrect true and no wrong letter', () => {
            const result = wordMatcher.checkWord('driver', 'driver');
            expect(result).toEqual({
                isCorrect: true,
                firstWrongLetter: -1
            });
        });

        test('case insensitive comparison works correctly', () => {
            const result = wordMatcher.checkWord('DrIvEr', 'dRiVeR');
            expect(result).toEqual({
                isCorrect: true,
                firstWrongLetter: -1
            });
        });

        test('wrong letter in middle - cow/couw', () => {
            const result = wordMatcher.checkWord('couw', 'cow');
            expect(result).toEqual({
                isCorrect: false,
                firstWrongLetter: 2
            });
        });

        test('missing letter - drvr/driver', () => {
            const result = wordMatcher.checkWord('drvr', 'driver');
            expect(result).toEqual({
                isCorrect: false,
                firstWrongLetter: 2
            });
        });

        test('extra letter at end - vet/vete', () => {
            const result = wordMatcher.checkWord('vete', 'vet');
            expect(result).toEqual({
                isCorrect: false,
                firstWrongLetter: 3
            });
        });

        test('completely different words', () => {
            const result = wordMatcher.checkWord('cat', 'dog');
            expect(result).toEqual({
                isCorrect: false,
                firstWrongLetter: 0
            });
        });

        test('empty user input', () => {
            const result = wordMatcher.checkWord('', 'test');
            expect(result).toEqual({
                isCorrect: false,
                firstWrongLetter: 0
            });
        });

        test('empty correct word', () => {
            const result = wordMatcher.checkWord('test', '');
            expect(result).toEqual({
                isCorrect: false,
                firstWrongLetter: 0
            });
        });

        test('both inputs empty', () => {
            const result = wordMatcher.checkWord('', '');
            expect(result).toEqual({
                isCorrect: true,
                firstWrongLetter: -1
            });
        });

        test('spaces in words are considered characters', () => {
            const result = wordMatcher.checkWord('ice cream', 'icecream');
            expect(result).toEqual({
                isCorrect: false,
                firstWrongLetter: 3
            });
        });

        test('leading spaces affect comparison', () => {
            const result = wordMatcher.checkWord(' cat', 'cat');
            expect(result).toEqual({
                isCorrect: false,
                firstWrongLetter: 0
            });
        });

        test('trailing spaces affect comparison', () => {
            const result = wordMatcher.checkWord('cat ', 'cat');
            expect(result).toEqual({
                isCorrect: false,
                firstWrongLetter: 3
            });
        });

        test('numbers are treated as characters', () => {
            const result = wordMatcher.checkWord('word123', 'word456');
            expect(result).toEqual({
                isCorrect: false,
                firstWrongLetter: 4
            });
        });

        test('special characters are treated as characters', () => {
            const result = wordMatcher.checkWord('hello!', 'hello?');
            expect(result).toEqual({
                isCorrect: false,
                firstWrongLetter: 5
            });
        });

        test('unicode characters are compared correctly', () => {
            const result = wordMatcher.checkWord('café', 'cafe');
            expect(result).toEqual({
                isCorrect: false,
                firstWrongLetter: 3
            });
        });

        test('very long words are compared correctly', () => {
            const longWord = 'pneumonoultramicroscopicsilicovolcanoconiosis';
            const wrongLongWord = 'pneumonoultramicroscopicsilicovolcanokoniosis';
            const result = wordMatcher.checkWord(wrongLongWord, longWord);
            expect(result).toEqual({
                isCorrect: false,
                firstWrongLetter: 37
            });
        });

        test('repeated characters are handled correctly', () => {
            const result = wordMatcher.checkWord('bookkeeper', 'bookeeper');
            expect(result).toEqual({
                isCorrect: false,
                firstWrongLetter: 4
            });
        });
    });
});
