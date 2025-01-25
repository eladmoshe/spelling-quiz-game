import WordMatcher from './wordMatcher.js';

describe('WordMatcher', () => {
    let wordMatcher;

    beforeEach(() => {
        wordMatcher = new WordMatcher();
    });

    describe('compareWords', () => {
        test('correct spelling returns all correct matches', () => {
            const result = wordMatcher.compareWords('driver', 'driver');
            expect(result).toEqual([
                { char: 'd', status: 'correct', type: 'match' },
                { char: 'r', status: 'correct', type: 'match' },
                { char: 'i', status: 'correct', type: 'match' },
                { char: 'v', status: 'correct', type: 'match' },
                { char: 'e', status: 'correct', type: 'match' },
                { char: 'r', status: 'correct', type: 'match' }
            ]);
        });

        test('missing vowels case - driver/drvr', () => {
            const result = wordMatcher.compareWords('drvr', 'driver');
            expect(result).toEqual([
                { char: 'd', status: 'correct', type: 'match' },
                { char: 'r', status: 'correct', type: 'match' },
                { char: 'v', status: 'wrong', type: 'extra' },
                { char: '_', status: 'missing', type: 'missing', correctChar: 'i' },
                { char: '_', status: 'missing', type: 'missing', correctChar: 'v' },
                { char: '_', status: 'missing', type: 'missing', correctChar: 'e' },
                { char: 'r', status: 'correct', type: 'match' }
            ]);
        });

        test('extra letter at end - vet/vete', () => {
            const result = wordMatcher.compareWords('vete', 'vet');
            expect(result).toEqual([
                { char: 'v', status: 'correct', type: 'match' },
                { char: 'e', status: 'correct', type: 'match' },
                { char: 't', status: 'correct', type: 'match' },
                { char: 'e', status: 'wrong', type: 'extra' }
            ]);
        });

        test('wrong letter in middle - cow/couw', () => {
            const result = wordMatcher.compareWords('couw', 'cow');
            expect(result).toEqual([
                { char: 'c', status: 'correct', type: 'match' },
                { char: 'o', status: 'correct', type: 'match' },
                { char: '_', status: 'missing', type: 'missing', correctChar: 'w' },
                { char: 'u', status: 'wrong', type: 'extra' },
                { char: 'w', status: 'wrong', type: 'extra' }
            ]);
        });

        test('wrong consonant - cow/cov', () => {
            const result = wordMatcher.compareWords('cov', 'cow');
            expect(result).toEqual([
                { char: 'c', status: 'correct', type: 'match' },
                { char: 'o', status: 'correct', type: 'match' },
                { char: '_', status: 'missing', type: 'missing', correctChar: 'w' },
                { char: 'v', status: 'wrong', type: 'extra' }
            ]);
        });

        test('empty user answer', () => {
            const result = wordMatcher.compareWords('', 'test');
            expect(result).toEqual([
                { char: '_', status: 'missing', type: 'missing', correctChar: 't' },
                { char: '_', status: 'missing', type: 'missing', correctChar: 'e' },
                { char: '_', status: 'missing', type: 'missing', correctChar: 's' },
                { char: '_', status: 'missing', type: 'missing', correctChar: 't' }
            ]);
        });

        test('case insensitive comparison', () => {
            const result = wordMatcher.compareWords('DrIvEr', 'dRiVeR');
            expect(result).toEqual([
                { char: 'd', status: 'correct', type: 'match' },
                { char: 'r', status: 'correct', type: 'match' },
                { char: 'i', status: 'correct', type: 'match' },
                { char: 'v', status: 'correct', type: 'match' },
                { char: 'e', status: 'correct', type: 'match' },
                { char: 'r', status: 'correct', type: 'match' }
            ]);
        });
    });

    describe('getHint', () => {
        it('returns hint for missing i in driver', () => {
            const matcher = new WordMatcher();
            const hint = matcher.getHint('drvr', 'driver');
            expect(hint).toEqual({
                word: 'drvr',  // Show user's input
                redLetterPositions: [],  // No letters in red
                underscorePositions: [2]  // Show underscore after 'dr'
            });
        });

        it('shows hint for wrong e in firemen', () => {
            const matcher = new WordMatcher();
            const hint = matcher.getHint('firemen', 'fireman');
            expect(hint).toEqual({
                word: 'firemen',  // Show user's input
                redLetterPositions: [5],  // Only the second 'e' should be red
                underscorePositions: []  // No underscores
            });
        });

        it('shows hint for missing e in vet', () => {
            const matcher = new WordMatcher();
            const hint = matcher.getHint('vt', 'vet');
            expect(hint).toEqual({
                word: 'vt',  // Show user's input
                redLetterPositions: [],  // No letters in red
                underscorePositions: [1]  // Show underscore after 'v'
            });
        });

        it('shows hint for extra t in vtt', () => {
            const matcher = new WordMatcher();
            const hint = matcher.getHint('vtt', 'vet');
            expect(hint).toEqual({
                word: 'vtt',  // Show user's input
                redLetterPositions: [1],  // First extra 't' should be red
                underscorePositions: []  // No underscores
            });
        });

        it('shows hint for missing u in nurse', () => {
            const matcher = new WordMatcher();
            const hint = matcher.getHint('nrse', 'nurse');
            expect(hint).toEqual({
                word: 'nrse',  // Show user's input
                redLetterPositions: [],  // No letters in red
                underscorePositions: [1]  // Show underscore after 'n'
            });
        });

        it('shows hint for firemen case', () => {
            const matcher = new WordMatcher();
            const hint = matcher.getHint('firemen', 'fireman');
            expect(hint).toEqual({
                word: 'firemen',  // Show user's input
                redLetterPositions: [5],  // The 'e' at position 5 should be red
                underscorePositions: []  // No underscores
            });
        });
    });
});
