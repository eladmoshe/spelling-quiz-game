import WordMatcher from './wordMatcher';
import { translations } from './translations';

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

    private handleStart(): void {
        const input = document.querySelector('#wordInput') as HTMLInputElement;
        if (!input) return;

        const words = input.value.split(',').map(word => word.trim()).filter(word => word);
        if (words.length > 0) {
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
        const hint = this.wordMatcher.getHint(userAnswer, currentWord);
        const firstUnderscoreIndex = hint.indexOf('_');
        
        if (firstUnderscoreIndex === -1) {
            return {
                correct: true,
                message: 'Correct!',
                progress: hint
            };
        }
        
        return {
            correct: false,
            message: `Check letter #${firstUnderscoreIndex + 1}. Should be: "${currentWord[firstUnderscoreIndex]}"`,
            progress: hint
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
                        ${this.getWordPatterns(currentWord)}
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

    private render(): void {
        if (!this.showPractice) {
            this.app.innerHTML = `
                <div class="card">
                    <div class="header-container">
                        <h1 class="title">Spelling Quiz</h1>
                        <button class="btn btn-outline lang-toggle" onclick="game.toggleLanguage()">
                            ${this.language === 'en' ? 'עברית' : 'English'}
                        </button>
                    </div>
                    <div class="space-y-4">
                        <input type="text" id="wordInput" class="input" 
                            placeholder="${translations[this.language].enterWords}">
                        <button class="btn btn-primary" onclick="game.handleStart()">
                            ${translations[this.language].start}
                        </button>
                    </div>
                </div>
            `;
        } else {
            const currentWord = this.wordList[this.currentIndex];
            this.app.innerHTML = `
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
            
            const answerInput = document.querySelector('#answerInput') as HTMLInputElement;
            if (answerInput) {
                answerInput.focus();
                answerInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        if (this.currentWordCorrect) {
                            this.nextWord();
                        } else {
                            this.checkAnswer();
                        }
                    }
                });
            }
        }
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
