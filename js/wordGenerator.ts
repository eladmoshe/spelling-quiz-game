export interface WordOptions {
    difficulty: 'easy' | 'medium' | 'hard';
    count: number;
}

export class WordGenerator {
    private readonly wordLists = {
        easy: [
            // Common 4-6 letter words that children learn early
            'book', 'cat', 'dog', 'fish', 'hat',
            'home', 'jump', 'like', 'love', 'milk',
            'play', 'read', 'run', 'sing', 'sit',
            'sun', 'time', 'walk', 'water', 'blue',
            'green', 'red', 'school', 'happy', 'smile'
        ],
        medium: [
            // Common 7-9 letter words from everyday life
            'birthday', 'brother', 'chicken', 'children',
            'computer', 'daughter', 'elephant', 'favorite',
            'football', 'hospital', 'kitchen', 'morning',
            'mountain', 'painting', 'rainbow', 'student',
            'teacher', 'weather', 'weekend', 'writing'
        ],
        hard: [
            // Challenging but recognizable 10+ letter words
            'basketball', 'butterfly', 'chocolate',
            'comfortable', 'dictionary', 'difference',
            'everything', 'friendship', 'important',
            'interested', 'playground', 'restaurant',
            'scientific', 'technology', 'television',
            'temperature', 'understand', 'vocabulary'
        ]
    };

    async getRandomWords(options: WordOptions): Promise<string[]> {
        try {
            const availableWords = this.wordLists[options.difficulty];
            const shuffled = [...availableWords].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, options.count);
        } catch (error) {
            console.error('Error getting random words:', error);
            return [];
        }
    }
}
