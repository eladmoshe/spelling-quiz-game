import { WordGenerator } from '../WordGenerator';
import { WordOptions } from '../../models/WordModel';

describe('WordGenerator', () => {
    let wordGenerator: WordGenerator;

    beforeEach(() => {
        wordGenerator = new WordGenerator();
    });

    describe('getRandomWords', () => {
        test('returns correct number of words for easy difficulty', async () => {
            const options: WordOptions = {
                difficulty: 'easy',
                count: 5
            };
            const words = await wordGenerator.getRandomWords(options);
            expect(words).toHaveLength(5);
        });

        test('returns correct number of words for medium difficulty', async () => {
            const options: WordOptions = {
                difficulty: 'medium',
                count: 3
            };
            const words = await wordGenerator.getRandomWords(options);
            expect(words).toHaveLength(3);
        });

        test('returns correct number of words for hard difficulty', async () => {
            const options: WordOptions = {
                difficulty: 'hard',
                count: 7
            };
            const words = await wordGenerator.getRandomWords(options);
            expect(words).toHaveLength(7);
        });

        test('returns empty array when count is 0', async () => {
            const options: WordOptions = {
                difficulty: 'easy',
                count: 0
            };
            const words = await wordGenerator.getRandomWords(options);
            expect(words).toHaveLength(0);
        });

        test('returns all unique words', async () => {
            const options: WordOptions = {
                difficulty: 'easy',
                count: 10
            };
            const words = await wordGenerator.getRandomWords(options);
            const uniqueWords = new Set(words);
            expect(uniqueWords.size).toBe(words.length);
        });

        test('returns different words on subsequent calls', async () => {
            const options: WordOptions = {
                difficulty: 'medium',
                count: 20
            };
            const firstSet = await wordGenerator.getRandomWords(options);
            const secondSet = await wordGenerator.getRandomWords(options);
            expect(firstSet).not.toEqual(secondSet);
        });

        it('easy words are 3-6 letters long', async () => {
            const options: WordOptions = {
                difficulty: 'easy',
                count: 10
            };
            const words = await wordGenerator.getRandomWords(options);
            words.forEach(word => {
                expect(word.length).toBeGreaterThanOrEqual(3);
                expect(word.length).toBeLessThanOrEqual(6);
            });
        });

        it('medium words are 7-9 letters long', async () => {
            const options: WordOptions = {
                difficulty: 'medium',
                count: 10
            };
            const words = await wordGenerator.getRandomWords(options);
            words.forEach(word => {
                expect(word.length).toBeGreaterThanOrEqual(5);
                expect(word.length).toBeLessThanOrEqual(9);
            });
        });

        it('hard words are 10+ letters long', async () => {
            const options: WordOptions = {
                difficulty: 'hard',
                count: 10
            };
            const words = await wordGenerator.getRandomWords(options);
            words.forEach(word => {
                expect(word.length).toBeGreaterThanOrEqual(7);
            });
        });

        it('handles count larger than available words', async () => {
            const options: WordOptions = {
                difficulty: 'easy',
                count: 1000
            };
            const words = await wordGenerator.getRandomWords(options);
            expect(words.length).toBeLessThan(1000);
            expect(words.length).toBeGreaterThan(0);
        });
    });

    describe('shuffleArray', () => {
        test('returns an array of the same length', () => {
            const array = [1, 2, 3, 4, 5];
            const shuffled = wordGenerator.shuffleArray(array);
            expect(shuffled.length).toBe(array.length);
        });

        test('returns a new array instance', () => {
            const array = [1, 2, 3, 4, 5];
            const shuffled = wordGenerator.shuffleArray(array);
            expect(shuffled).not.toBe(array);
        });

        test('contains all the same elements', () => {
            const array = [1, 2, 3, 4, 5];
            const shuffled = wordGenerator.shuffleArray(array);
            expect(shuffled.sort()).toEqual(array.sort());
        });

        test('does not modify the original array', () => {
            const array = [1, 2, 3, 4, 5];
            const original = [...array];
            wordGenerator.shuffleArray(array);
            expect(array).toEqual(original);
        });

        test('empty array returns empty array', () => {
            const array: number[] = [];
            const shuffled = wordGenerator.shuffleArray(array);
            expect(shuffled).toEqual([]);
        });

        test('single item array returns same array', () => {
            const array = [1];
            const shuffled = wordGenerator.shuffleArray(array);
            expect(shuffled).toEqual([1]);
        });
    });
});
