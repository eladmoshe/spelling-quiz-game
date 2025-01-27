import WordMatcher from './wordMatcher.js';
import { translations } from './translations.js';

type Language = 'en' | 'he';

class SpellingGame {
    private wordList: string[] = [];
    private currentIndex: number = 0;
    private showPractice: boolean = false;
    private attempts: Record<number, number> = {};
    private wrongAttempts: Record<number, string[]> = {};
    private currentWordCorrect: boolean = false;
    private language: Language;
    private app: HTMLElement;
    private wordMatcher: WordMatcher;
    private readonly PREVIOUS_SETS_KEY = 'previousWordSets';
    private readonly MAX_STORED_SETS = 5;

    constructor() {
        const savedLanguage = localStorage.getItem('spellingQuizLanguage');
        this.language = (savedLanguage === 'en' || savedLanguage === 'he') ? savedLanguage : 'he';
        const appElement = document.getElementById('app');
        if (!appElement) {
            throw new Error('App element not found');
        }
        this.app = appElement;
        this.wordMatcher = new WordMatcher();
        this.render();
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (!this.showPractice) return;
            
            if (e.code === 'Space' && !(e.target instanceof HTMLInputElement)) {
                e.preventDefault();
                this.pronounceWord(this.wordList[this.currentIndex]);
            } else if (e.code === 'Enter') {
                e.preventDefault();
                if (this.currentWordCorrect) {
                    this.nextWord();
                } else {
                    this.checkAnswer();
                }
            }
        });
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
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
    }

    private getPreviousWordSets(): string[][] {
        const savedSets = localStorage.getItem(this.PREVIOUS_SETS_KEY);
        return savedSets ? JSON.parse(savedSets) : [];
    }

    private areWordSetsEqual(set1: string[], set2: string[]): boolean {
        if (set1.length !== set2.length) return false;
        return set1.join(',') === set2.join(',');
    }

    private savePreviousWordSet(words: string[]): void {
        const previousSets = this.getPreviousWordSets();
        // Filter out any sets that are identical to the new one
        const uniqueSets = previousSets.filter(set => !this.areWordSetsEqual(set, words));
        const newSets = [words, ...uniqueSets].slice(0, this.MAX_STORED_SETS);
        localStorage.setItem(this.PREVIOUS_SETS_KEY, JSON.stringify(newSets));
    }

    private getNextLetterHint(userAnswer: string): { correct: boolean; message: string; progress: string } {
        const currentWord = this.wordList[this.currentIndex];
        const result = this.wordMatcher.checkWord(userAnswer, currentWord);
        
        if (result.isCorrect) {
            return {
                correct: true,
                message: translations[this.language].correct,
                progress: currentWord
            };
        }

        // Format the display string based on the first wrong letter
        let progress = '';
        if (result.firstWrongLetter === userAnswer.length) {
            // Missing letter at the end
            progress = userAnswer + '<span class="text-red-500 font-bold">_</span>';
        } else {
            // Show letters up to the wrong one normally, then mark wrong letter in red
            // and grey out the rest as unchecked
            progress = userAnswer.slice(0, result.firstWrongLetter) +
                      `<span class="text-red-500">${userAnswer[result.firstWrongLetter] || '_'}</span>` +
                      (result.firstWrongLetter + 1 < userAnswer.length ? 
                       `<span class="text-gray-400">${userAnswer.slice(result.firstWrongLetter + 1)}</span>` : '');
        }

        return {
            correct: false,
            message: translations[this.language].incorrect,
            progress
        };
    }

    private createConfetti(): void {
        const shapes = ['square', 'triangle', 'circle'];
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = `confetti ${shapes[Math.floor(Math.random() * shapes.length)]}`;
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = `${Math.random() * 2}s`;
            confetti.style.animationDuration = `${3 + Math.random() * 2}s`;
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 5000);
        }
    }

    private getCompletionStats(): { totalAttempts: number; perfectWords: number } {
        const totalAttempts = Object.values(this.attempts).reduce((sum, attempts) => sum + attempts, 0);
        const perfectWords = Object.values(this.attempts).filter(attempts => attempts === 1).length;
        return { totalAttempts, perfectWords };
    }

    private renderCompletionScreen(): string {
        const stats = this.getCompletionStats();
        const accuracy = Math.round((stats.perfectWords / this.wordList.length) * 100);
        
        // Generate mistakes report
        let mistakesReport = '';
        this.wordList.forEach((word, index) => {
            if (this.wrongAttempts[index] && this.wrongAttempts[index].length > 0) {
                mistakesReport += `
                    <div class="text-left mb-2">
                        <div class="font-medium">${word}</div>
                        <div class="text-sm text-gray-600 ml-4">
                            ${this.wrongAttempts[index].map(attempt => 
                                `<div>❌ ${attempt}</div>`
                            ).join('')}
                        </div>
                    </div>
                `;
            }
        });

        return `
            <div class="card text-center">
                <div class="space-y-8">
                    <div class="space-y-4">
                        <div class="text-6xl mb-4">🎉</div>
                        <h1 class="text-3xl font-bold text-gray-900">
                            ${translations[this.language].practiceComplete}
                        </h1>
                        <p class="text-lg text-gray-600">
                            ${translations[this.language].greatJob || 'Great job practicing your spelling!'}
                        </p>
                    </div>

                    <div class="grid grid-cols-3 gap-4">
                        <div class="bg-blue-50 p-4 rounded-lg">
                            <div class="text-2xl font-bold text-blue-600">${this.wordList.length}</div>
                            <div class="text-sm text-gray-600">${translations[this.language].totalWords || 'Total Words'}</div>
                        </div>
                        <div class="bg-green-50 p-4 rounded-lg">
                            <div class="text-2xl font-bold text-green-600">${stats.perfectWords}</div>
                            <div class="text-sm text-gray-600">${translations[this.language].perfectWords || 'Perfect Words'}</div>
                        </div>
                        <div class="bg-yellow-50 p-4 rounded-lg">
                            <div class="text-2xl font-bold text-yellow-600">${accuracy}%</div>
                            <div class="text-sm text-gray-600">${translations[this.language].accuracy || 'Accuracy'}</div>
                        </div>
                    </div>

                    ${mistakesReport ? `
                        <div class="text-left">
                            <details class="bg-white rounded-lg shadow p-4">
                                <summary class="cursor-pointer font-medium text-gray-900">
                                    ${translations[this.language].showMistakes || 'Show Mistakes'}
                                </summary>
                                <div class="mt-4 space-y-2">
                                    ${mistakesReport}
                                </div>
                            </details>
                        </div>
                    ` : ''}

                    <div class="space-y-4">
                        <button onclick="window.game.startOver()" class="btn btn-primary">
                            ${translations[this.language].startOver}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    public startOver(): void {
        this.showPractice = false;
        this.wordList = [];
        this.currentIndex = 0;
        this.attempts = {};
        this.wrongAttempts = {};
        this.currentWordCorrect = false;
        this.render();
    }

    public nextWord(): void {
        if (this.currentIndex < this.wordList.length - 1) {
            this.currentIndex++;
            this.currentWordCorrect = false;
            this.pronounceWord(this.wordList[this.currentIndex]);
            this.render();
        } else {
            // Show completion screen with confetti
            this.showPractice = false;
            this.createConfetti();
            this.render();
        }
    }

    private renderPreviousSets(): string {
        const previousSets = this.getPreviousWordSets();
        if (previousSets.length === 0) return '';

        return `
            <div class="space-y-2">
                <h2 class="text-sm font-medium text-gray-700">${translations[this.language].previousSets}</h2>
                <div class="space-y-2">
                    ${previousSets.map((set, index) => `
                        <button 
                            class="btn btn-outline w-full text-left px-4 py-2"
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

    private renderPracticeSection(): string {
        const currentWord = this.wordList[this.currentIndex];
        const progress = ((this.currentIndex + 1) / this.wordList.length) * 100;
        
        return `
            <div class="card">
                <div class="space-y-6">
                    <div class="flex justify-between items-center">
                        <div>
                            <h2 class="text-lg font-medium">Word ${this.currentIndex + 1}/${this.wordList.length}</h2>
                            <div class="word-status">
                                ${this.wordList.map((_, index) => `
                                    <span class="word-status-dot ${
                                        index < this.currentIndex ? 'correct' :
                                        index === this.currentIndex ? (this.currentWordCorrect ? 'correct' : 'pending') :
                                        'pending'
                                    }"></span>
                                `).join('')}
                            </div>
                        </div>
                        <button class="btn btn-outline" onclick="game.pronounceWord('${currentWord}')" title="${translations[this.language].listen} (Press Space)">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z">
                                </path>
                            </svg>
                        </button>
                    </div>

                    <div class="progress-bar">
                        <div class="progress-bar-fill" style="width: ${progress}%"></div>
                    </div>

                    <div class="relative">
                        <input type="text" 
                            id="answerInput" 
                            class="input text-center text-2xl" 
                            placeholder="${translations[this.language].typePlaceholder || 'Type the word...'}"
                            ${this.currentWordCorrect ? 'disabled' : ''}
                            autocomplete="off"
                            autocorrect="off"
                            spellcheck="false"
                            value="${this.currentWordCorrect ? currentWord : ''}"
                        >
                        ${!this.currentWordCorrect ? `
                            <div class="hint text-center">
                                ${translations[this.language].pressEnter || 'Press Enter to check'}
                            </div>
                        ` : ''}
                    </div>

                    <div class="space-x-4 flex">
                        ${!this.currentWordCorrect ? `
                            <button class="btn btn-primary flex-1" onclick="game.checkAnswer()" 
                                title="${translations[this.language].check} (Press Enter)">
                                ${translations[this.language].check}
                            </button>
                        ` : `
                            <button class="btn btn-primary flex-1" onclick="game.nextWord()"
                                title="${translations[this.language].next} (Press Enter)">
                                ${translations[this.language].next}
                            </button>
                        `}
                    </div>

                    ${this.currentWordCorrect ? `
                        <div class="success-feedback">
                            <div class="flex items-center justify-center gap-2">
                                <span class="success-medal">🏅</span>
                                <span class="text-lg font-medium">${translations[this.language].correct}</span>
                            </div>
                            ${this.attempts[this.currentIndex] > 1 ? 
                                `<p class="text-sm mt-2">${translations[this.language].attemptsMessage?.replace('{count}', this.attempts[this.currentIndex].toString()) || 
                                `It took ${this.attempts[this.currentIndex]} attempts`}</p>` : 
                                ''
                            }
                            ${this.getWordPatterns(this.wordList[this.currentIndex])}
                        </div>
                    ` : `
                        <div id="result" class="transition-all duration-300">
                            ${this.attempts[this.currentIndex] > 0 ? `
                                <div class="mt-4 space-y-4">
                                    <p class="text-red-500 text-center">${translations[this.language].incorrect}</p>
                                    <p class="text-2xl font-mono tracking-wide text-center">${this.getNextLetterHint(this.wrongAttempts[this.currentIndex]?.slice(-1)[0] || '').progress}</p>
                                </div>
                            ` : ''}
                        </div>
                    `}
                </div>
            </div>
        `;
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

        const currentWord = this.wordList[this.currentIndex];
        const userAnswer = input.value.trim();

        if (!this.attempts[this.currentIndex]) {
            this.attempts[this.currentIndex] = 0;
            this.wrongAttempts[this.currentIndex] = [];
        }
        this.attempts[this.currentIndex]++;

        const result = this.wordMatcher.checkWord(currentWord, userAnswer);
        if (result.isCorrect) {
            this.currentWordCorrect = true;
            input.value = currentWord;
        } else {
            if (!this.wrongAttempts[this.currentIndex].includes(userAnswer)) {
                this.wrongAttempts[this.currentIndex].push(userAnswer);
            }
            const hint = this.getNextLetterHint(userAnswer);
            input.placeholder = hint.message;
        }
        this.render();
    }

    private render(): void {
        let content;
        
        if (!this.showPractice && this.wordList.length > 0) {
            // Show completion screen
            content = this.renderCompletionScreen();
        } else if (!this.showPractice) {
            // Show initial screen
            content = `
                <div class="card">
                    <div class="space-y-6">
                        <div class="text-center">
                            <h1 class="title">
                                ${translations[this.language].title}
                            </h1>
                        </div>
                        <div class="space-y-4">
                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-gray-700">
                                    ${translations[this.language].enterWords}
                                </label>
                                <input 
                                    type="text" 
                                    id="wordInput" 
                                    class="input" 
                                    placeholder="${translations[this.language].wordsPlaceholder}"
                                    autocomplete="off"
                                    spellcheck="false"
                                >
                                <p class="hint">
                                    ${translations[this.language].instructions}
                                </p>
                            </div>
                            <button 
                                onclick="window.game.startGame()"
                                class="btn btn-primary"
                            >
                                ${translations[this.language].start}
                            </button>
                        </div>
                        ${this.renderPreviousSets()}
                    </div>
                </div>
            `;
        } else {
            // Show practice screen
            content = this.renderPracticeSection();
        }
        
        this.app.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-2xl">
                <div class="flex justify-end mb-4">
                    <button 
                        onclick="window.game.toggleLanguage()"
                        class="btn btn-outline lang-toggle"
                    >
                        ${this.language === 'en' ? 'עברית' : 'English'}
                    </button>
                </div>
                ${content}
            </div>
        `;
    }

    public toggleLanguage(): void {
        this.language = this.language === 'en' ? 'he' : 'en';
        localStorage.setItem('spellingQuizLanguage', this.language);
        this.render();
    }

    public startGame(): void {
        const input = document.querySelector('#wordInput') as HTMLInputElement;
        if (!input) return;

        const words = input.value.split(',').map(word => word.trim()).filter(word => word);
        if (words.length > 0) {
            this.savePreviousWordSet(words);
            this.wordList = this.shuffleArray(words);
            this.currentIndex = 0;
            this.attempts = {};
            this.wrongAttempts = {};
            this.showPractice = true;
            this.pronounceWord(this.wordList[0]);
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
