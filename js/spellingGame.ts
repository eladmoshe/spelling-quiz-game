import WordMatcher from './wordMatcher.js';
import { translations } from './translations.js';

type Language = 'en' | 'he';

interface GameState {
    wordList: string[];
    currentIndex: number;
    showPractice: boolean;
    attempts: Record<number, number>;
    currentWordCorrect: boolean;
    language: Language;
}

class SpellingGame {
    private wordList: string[] = [];
    private currentIndex: number = 0;
    private showPractice: boolean = false;
    private attempts: Record<number, number> = {};
    private currentWordCorrect: boolean = false;
    private language: Language;
    private app: HTMLElement;
    private wordMatcher: WordMatcher;
    private readonly PREVIOUS_SETS_KEY = 'previousWordSets';
    private readonly MAX_STORED_SETS = 5;

    constructor() {
        const savedLanguage = localStorage.getItem('spellingQuizLanguage');
        this.language = (savedLanguage === 'en' || savedLanguage === 'he') ? savedLanguage : 'en';
        const appElement = document.getElementById('app');
        if (!appElement) {
            throw new Error('App element not found');
        }
        this.app = appElement;
        this.wordMatcher = new WordMatcher();
        this.render();
    }

    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    private pronounceWord(word: string): void {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.rate = 0.5;
        utterance.pitch = 1;
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
    }

    private getPreviousWordSets(): string[][] {
        const stored = localStorage.getItem(this.PREVIOUS_SETS_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    private savePreviousWordSet(words: string[]): void {
        const previousSets = this.getPreviousWordSets();
        // Only add if it's different from the most recent set
        if (previousSets.length === 0 || JSON.stringify(words) !== JSON.stringify(previousSets[0])) {
            previousSets.unshift(words);
            if (previousSets.length > this.MAX_STORED_SETS) {
                previousSets.pop();
            }
            localStorage.setItem(this.PREVIOUS_SETS_KEY, JSON.stringify(previousSets));
        }
    }

    private handleStart(): void {
        const input = document.querySelector('#wordInput') as HTMLInputElement;
        if (!input) return;

        const words = input.value.split(',').map(word => word.trim()).filter(word => word);
        if (words.length > 0) {
            this.savePreviousWordSet(words);
            this.wordList = this.shuffleArray(words);
            this.currentIndex = 0;
            this.attempts = {};
            this.showPractice = true;
            this.pronounceWord(this.wordList[0]);
            this.render();
        }
    }

    private getNextLetterHint(userAnswer: string): { correct: boolean; message: string; progress: string } {
        const currentWord = this.wordList[this.currentIndex];
        const result = this.wordMatcher.checkWord(userAnswer, currentWord);
        
        if (result.isCorrect) {
            return {
                correct: true,
                message: 'Correct!',
                progress: userAnswer
            };
        }

        // Format the display string based on the first wrong letter
        let progress = '';
        if (result.firstWrongLetter === userAnswer.length) {
            // Missing letter at the end
            progress = userAnswer + '<span class="wrong">_</span>';
        } else {
            // Show letters up to the wrong one normally, then mark wrong letter in red
            // and grey out the rest as unchecked
            progress = userAnswer.slice(0, result.firstWrongLetter) +
                      `<span class="wrong">${userAnswer[result.firstWrongLetter]}</span>` +
                      (result.firstWrongLetter + 1 < userAnswer.length ? 
                       `<span class="unchecked">${userAnswer.slice(result.firstWrongLetter + 1)}</span>` : '');
        }
        
        return {
            correct: false,
            message: 'Check your answer.',
            progress
        };
    }

    private getWordPatterns(word: string): string {
        let html = '<div class="space-y-2"><p class="text-2xl font-mono tracking-wide text-center">';
        
        const blends = ['bl','br','ch','cl','cr','dr','fl','fr','gl','gr','pl','pr','sc','sh','sk','sl','sm','sn','sp','st','sw','th','tr','tw','wh'];
        const vowelPairs = ['ai','ay','ea','ee','ei','ey','ie','oa','oe','oi','oo','ou','ow','oy'];
        
        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            let isBlend = false;
            let isVowelPair = false;
            
            if (i < word.length - 1) {
                const pair = word.slice(i, i + 2).toLowerCase();
                if (blends.includes(pair)) {
                    html += `<span class="text-blue-500">${word.slice(i, i + 2)}</span>`;
                    isBlend = true;
                    i++;
                } else if (vowelPairs.includes(pair)) {
                    html += `<span class="text-green-500">${word.slice(i, i + 2)}</span>`;
                    isVowelPair = true;
                    i++;
                }
            }
            
            if (!isBlend && !isVowelPair) {
                html += char;
            }
        }
        
        html += '</p>';
        html += `<div class="text-sm space-y-1">
            <p><span class="text-blue-500">■</span> ${translations[this.language].patterns.consonantBlends}</p>
            <p><span class="text-green-500">■</span> ${translations[this.language].patterns.vowelPairs}</p>
        </div></div>`;
        
        return html;
    }

    private checkAnswer(): void {
        const input = document.querySelector('#answerInput') as HTMLInputElement;
        if (!input) return;

        const userAnswer = input.value.trim().toLowerCase();
        const currentWord = this.wordList[this.currentIndex].toLowerCase();
        
        if (!this.attempts[this.currentIndex]) {
            this.attempts[this.currentIndex] = 0;
        }
        this.attempts[this.currentIndex]++;
        
        if (userAnswer === currentWord) {
            this.currentWordCorrect = true;
            this.showSuccess();
        } else {
            const hint = this.getNextLetterHint(userAnswer);
            const resultDiv = document.querySelector('#result');
            if (resultDiv) {
                resultDiv.innerHTML = `
                    <div class="mt-4 space-y-4">
                        <p class="text-red-500">${hint.message}</p>
                        <p class="text-2xl font-mono tracking-wide text-center">${hint.progress}</p>
                    </div>
                `;
            }
        }
    }

    private showSuccess(): void {
        const resultDiv = document.querySelector('#result');
        if (!resultDiv) return;

        resultDiv.innerHTML = `
            <div class="space-y-4">
                <div class="flex items-center justify-center gap-2 text-green-500">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span class="text-lg font-medium">${translations[this.language].correct}</span>
                </div>
                ${this.getWordPatterns(this.wordList[this.currentIndex])}
            </div>
        `;

        this.createConfetti();
    }

    private createConfetti(): void {
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 80%, 50%)`;
            confetti.style.animation = `confetti ${1 + Math.random() * 2}s linear forwards`;
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 3000);
        }
    }

    private renderPreviousSets(): string {
        const previousSets = this.getPreviousWordSets();
        if (previousSets.length === 0) return '';

        return `
            <div class="mt-4">
                <p class="text-sm text-gray-600 mb-2">${translations[this.language].previousSets || 'Previous Sets'}:</p>
                <div class="space-y-2">
                    ${previousSets.map((set, index) => `
                        <button 
                            class="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                            onclick="window.game.loadPreviousSet(${index})"
                        >
                            ${set.join(', ')}
                        </button>
                    `).join('')}
                </div>
            </div>`;
    }

    public loadPreviousSet(index: number): void {
        const previousSets = this.getPreviousWordSets();
        if (index >= 0 && index < previousSets.length) {
            const input = document.querySelector('#wordInput') as HTMLInputElement;
            if (input) {
                input.value = previousSets[index].join(', ');
            }
        }
    }

    private render(): void {
        const practiceSection = this.showPractice ? this.renderPracticeSection() : '';
        
        this.app.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-2xl">
                <div class="flex justify-end mb-4">
                    <button 
                        onclick="window.game.toggleLanguage()"
                        class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                    >
                        ${this.language === 'en' ? 'עברית' : 'English'}
                    </button>
                </div>
                ${!this.showPractice ? `
                    <div class="space-y-4">
                        <h1 class="text-3xl font-bold text-center mb-8">
                            ${translations[this.language].title}
                        </h1>
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700">
                                ${translations[this.language].enterWords}
                            </label>
                            <input 
                                type="text" 
                                id="wordInput" 
                                class="w-full p-2 border rounded" 
                                placeholder="${translations[this.language].wordsPlaceholder}"
                            >
                            <p class="text-sm text-gray-500">
                                ${translations[this.language].instructions}
                            </p>
                        </div>
                        <button 
                            onclick="window.game.handleStart()"
                            class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                            ${translations[this.language].start}
                        </button>
                        ${this.renderPreviousSets()}
                    </div>
                ` : practiceSection}
            </div>
        `;
    }

    private renderPracticeSection(): string {
        const currentWord = this.wordList[this.currentIndex];
        return `
            <div class="card">
                <div class="space-y-6">
                    <div class="flex justify-between items-center">
                        <h2 class="text-lg font-medium">Word ${this.currentIndex + 1}/${this.wordList.length}</h2>
                        <button class="btn btn-outline" onclick="game.pronounceWord('${currentWord}')">
                            ${translations[this.language].listen}
                        </button>
                    </div>
                    <input type="text" id="answerInput" class="input text-center text-2xl" 
                        placeholder="Type the word..." ${this.currentWordCorrect ? 'disabled' : ''}>
                    <div class="space-x-4 flex">
                        ${!this.currentWordCorrect ? `
                            <button class="btn btn-primary flex-1" onclick="game.checkAnswer()">
                                ${translations[this.language].check}
                            </button>
                        ` : `
                            <button class="btn btn-primary flex-1" onclick="game.nextWord()">
                                ${translations[this.language].next}
                            </button>
                        `}
                    </div>
                    <div id="result"></div>
                </div>
            </div>
        `;
    }

    public toggleLanguage(): void {
        this.language = this.language === 'en' ? 'he' : 'en';
        localStorage.setItem('spellingQuizLanguage', this.language);
        this.render();
    }

    public nextWord(): void {
        if (this.currentIndex < this.wordList.length - 1) {
            this.currentIndex++;
            this.currentWordCorrect = false;
            this.pronounceWord(this.wordList[this.currentIndex]);
            this.render();
        } else {
            this.showPractice = false;
            this.render();
        }
    }
}

// Create and initialize the game instance
declare global {
    interface Window {
        game: SpellingGame;
    }
}

window.game = new SpellingGame();
