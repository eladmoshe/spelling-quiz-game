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

        test('completely different word', () => {
            const result = wordMatcher.compareWords('xyz', 'abc');
            expect(result).toEqual([
                { char: '_', status: 'missing', type: 'missing', correctChar: 'a' },
                { char: '_', status: 'missing', type: 'missing', correctChar: 'b' },
                { char: '_', status: 'missing', type: 'missing', correctChar: 'c' },
                { char: 'x', status: 'wrong', type: 'extra' },
                { char: 'y', status: 'wrong', type: 'extra' },
                { char: 'z', status: 'wrong', type: 'extra' }
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

        test('longer user answer than correct word', () => {
            const result = wordMatcher.compareWords('drivers', 'driver');
            expect(result).toEqual([
                { char: 'd', status: 'correct', type: 'match' },
                { char: 'r', status: 'correct', type: 'match' },
                { char: 'i', status: 'correct', type: 'match' },
                { char: 'v', status: 'correct', type: 'match' },
                { char: 'e', status: 'correct', type: 'match' },
                { char: 'r', status: 'correct', type: 'match' },
                { char: 's', status: 'wrong', type: 'extra' }
            ]);
        });
    });

    describe('getHint', () => {
        test('returns hint with underscores for missing letters', () => {
            const hint = wordMatcher.getHint('drvr', 'driver');
            expect(hint).toBe('dr_ver');
        });
    });
});
