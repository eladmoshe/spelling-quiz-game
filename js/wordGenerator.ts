export interface WordOptions {
    difficulty: 'easy' | 'medium' | 'hard';
    count: number;
}

export class WordGenerator {
    private readonly API_URL = 'https://random-word-api.herokuapp.com/word';
    
    async getRandomWords(options: WordOptions): Promise<string[]> {
        try {
            // The length of the word determines its difficulty
            const minLength = this.getDifficultyLength(options.difficulty);
            const response = await fetch(`${this.API_URL}?number=${options.count}&length=${minLength}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch words');
            }
            
            const words = await response.json();
            return words;
        } catch (error) {
            console.error('Error fetching random words:', error);
            return [];
        }
    }
    
    private getDifficultyLength(difficulty: WordOptions['difficulty']): number {
        switch (difficulty) {
            case 'easy':
                return 4; // 4-6 letters
            case 'medium':
                return 7; // 7-9 letters
            case 'hard':
                return 10; // 10+ letters
            default:
                return 4;
        }
    }
}
