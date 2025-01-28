import WordMatcher from './wordMatcher.js';
import { translations } from './translations.js';
import { Analytics } from './analytics.js';
import { WordGenerator, WordOptions } from './wordGenerator.js';

type Language = 'en' | 'he';
type InputMode = 'manual' | 'random';

class SpellingGame {
    private wordList: string[] = [];
    private currentIndex: number = 0;
    private showPractice: boolean = false;
    private attempts: Record<number, number> = {};
    private wrongAttempts: Record<number, string[]> = {};
    private currentWordCorrect: boolean = false;
    private language: Language;
    private inputMode: InputMode = 'manual';
    private app: HTMLElement;
    private wordMatcher: WordMatcher;
    private wordGenerator: WordGenerator;
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
        this.wordGenerator = new WordGenerator();
        this.render();
        this.setupEventListeners();
    }

    private async render(): Promise<void> {
        const t = translations[this.language];
        this.app.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-2xl">
                <div class="flex justify-end mb-4">
                    <button id="languageToggle" class="btn btn-outline">
                        ${this.language === 'he' ? 'English' : 'עברית'}
                    </button>
                </div>
                
                ${!this.showPractice ? `
                    <div class="card">
                        <div class="space-y-6">
                            <div class="text-center">
                                <h1 class="title">
                                    ${t.title}
                                </h1>
                            </div>
                            
                            <div class="space-y-4">
                                <div class="space-y-2">
                                    <label class="block text-sm font-medium text-gray-700">
                                        ${t.selectMode}
                                    </label>
                                    <div class="flex space-x-4 mb-4">
                                        <button id="manualMode" class="btn ${this.inputMode === 'manual' ? 'btn-primary' : 'btn-outline'} flex-1">
                                            ${t.manualEntry}
                                        </button>
                                        <button id="randomMode" class="btn ${this.inputMode === 'random' ? 'btn-primary' : 'btn-outline'} flex-1">
                                            ${t.randomWords}
                                        </button>
                                    </div>
                                    
                                    ${this.inputMode === 'manual' ? `
                                        <div class="space-y-2">
                                            <label class="block text-sm font-medium text-gray-700">
                                                ${t.enterWords}
                                            </label>
                                            <textarea id="wordInput" rows="5" 
                                                class="input w-full" 
                                                placeholder="${t.wordsPlaceholder}"
                                                spellcheck="false"
                                            ></textarea>
                                        </div>
                                    ` : `
                                        <div class="space-y-4">
                                            <div class="flex-1">
                                                <label class="block text-sm font-medium text-gray-700">
                                                    ${t.difficulty}
                                                </label>
                                                <select id="difficulty" class="input w-full">
                                                    <option value="easy">${t.easy}</option>
                                                    <option value="medium">${t.medium}</option>
                                                    <option value="hard">${t.hard}</option>
                                                </select>
                                            </div>
                                            
                                            <div class="flex-1">
                                                <label class="block text-sm font-medium text-gray-700">
                                                    ${t.wordCount}
                                                </label>
                                                <input type="number" id="wordCount" min="1" max="20" value="10" 
                                                    class="input w-full">
                                            </div>
                                        </div>
                                    `}
                                    
                                    <button id="startPractice" class="btn btn-primary w-full mt-4">
                                        ${t.startPractice}
                                    </button>
                                </div>
                                
                                <p class="hint">
                                    ${t.instructions}
                                </p>
                            </div>
                            
                            ${this.renderPreviousWordSets()}
                        </div>
                    </div>
                ` : this.renderPractice()}
            </div>
        `;
        
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        const languageToggle = document.getElementById('languageToggle');
        languageToggle?.addEventListener('click', () => this.toggleLanguage());

        const startOver = document.getElementById('startOver');
        startOver?.addEventListener('click', () => {
            this.showPractice = false;
            this.currentIndex = 0;
            this.attempts = {};
            this.wrongAttempts = {};
            this.currentWordCorrect = false;
            this.render();
        });

        if (!this.showPractice) {
            const startPractice = document.getElementById('startPractice');
            const manualMode = document.getElementById('manualMode');
            const randomMode = document.getElementById('randomMode');
            const wordInput = document.getElementById('wordInput') as HTMLTextAreaElement;
            const difficultySelect = document.getElementById('difficulty') as HTMLSelectElement;
            const wordCountInput = document.getElementById('wordCount') as HTMLInputElement;

            manualMode?.addEventListener('click', () => {
                this.inputMode = 'manual';
                this.render();
            });

            randomMode?.addEventListener('click', () => {
                this.inputMode = 'random';
                this.render();
            });

            startPractice?.addEventListener('click', async () => {
                if (this.inputMode === 'manual') {
                    const words = wordInput.value
                        .split(/[\n,]/)
                        .map(word => word.trim())
                        .filter(word => word && /^[a-zA-Z]+$/.test(word));

                    if (words.length === 0) {
                        wordInput.classList.add('error');
                        wordInput.value = '';
                        wordInput.placeholder = translations[this.language].onlyEnglishLetters;
                        
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'text-red-500 text-sm mt-1';
                        errorDiv.textContent = translations[this.language].onlyEnglishLetters;
                        
                        const existingError = wordInput.parentElement?.querySelector('.text-red-500');
                        if (existingError) {
                            existingError.remove();
                        }
                        
                        wordInput.parentElement?.appendChild(errorDiv);
                        
                        setTimeout(() => {
                            wordInput.classList.remove('error');
                            errorDiv.remove();
                            wordInput.placeholder = translations[this.language].wordsPlaceholder;
                        }, 3000);
                        
                        return;
                    }

                    this.wordList = words;
                } else {
                    const options: WordOptions = {
                        difficulty: difficultySelect.value as WordOptions['difficulty'],
                        count: parseInt(wordCountInput.value, 10)
                    };
                    
                    this.wordList = await this.wordGenerator.getRandomWords(options);
                    if (this.wordList.length === 0) {
                        return;
                    }
                }

                this.showPractice = true;
                this.currentIndex = 0;
                this.attempts = {};
                this.wrongAttempts = {};
                this.currentWordCorrect = false;
                this.savePreviousWordSet(this.wordList);
                await this.showNextWord();
            });

            wordInput?.addEventListener('input', () => {
                wordInput.classList.remove('error');
            });
        } else {
            const listenButton = document.getElementById('listenButton');
            const checkButton = document.getElementById('checkButton');
            const nextButton = document.getElementById('nextButton');
            const answerInput = document.getElementById('answerInput') as HTMLInputElement;

            listenButton?.addEventListener('click', () => {
                this.playCurrentWord();
            });

            checkButton?.addEventListener('click', () => {
                this.checkAnswer();
            });

            nextButton?.addEventListener('click', () => {
                this.nextWord();
            });

            answerInput?.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (this.currentWordCorrect) {
                        this.nextWord();
                    } else {
                        this.checkAnswer();
                    }
                }
            });
        }
    }

    private async showNextWord(): Promise<void> {
        if (this.currentIndex < this.wordList.length) {
            this.currentWordCorrect = false;
            await this.render();
            
            const input = document.querySelector('#answerInput') as HTMLInputElement;
            if (input) {
                input.value = '';
                input.placeholder = translations[this.language].typePlaceholder;
                input.focus();
            }
            
            await this.playCurrentWord();
        } else {
            await this.render();
        }
    }

    private async playCurrentWord(): Promise<void> {
        const currentWord = this.wordList[this.currentIndex];
        if (!currentWord) return;

        try {
            const utterance = new SpeechSynthesisUtterance(currentWord);
            utterance.lang = this.language;
            window.speechSynthesis.speak(utterance);
        } catch (error) {
            console.error('Error playing word:', error);
        }
    }

    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
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

    private getNextLetterHint(userAnswer: string): { correct: boolean; message: string; progress: string; wrongLetterPosition: number } {
        const currentWord = this.wordList[this.currentIndex];
        const result = this.wordMatcher.checkWord(currentWord, userAnswer);
        
        if (result.isCorrect) {
            return {
                correct: true,
                message: translations[this.language].correct,
                progress: currentWord,
                wrongLetterPosition: -1
            };
        }

        // Format the display string based on the first wrong letter
        let progress = '';
        if (result.firstWrongLetter === userAnswer.length) {
            // Missing letter at the end
            progress = `<span class="text-green-600">${userAnswer}</span><span class="text-red-500 font-bold">_</span>`;
        } else {
            // Show letters up to the wrong one in green, then mark wrong letter in red
            // and grey out the rest as unchecked
            progress = `<span class="text-green-600">${userAnswer.slice(0, result.firstWrongLetter)}</span>` +
                      `<span class="text-red-500">${userAnswer[result.firstWrongLetter] || '_'}</span>` +
                      (result.firstWrongLetter + 1 < userAnswer.length ? 
                       `<span class="text-gray-400">${userAnswer.slice(result.firstWrongLetter + 1)}</span>` : '');
        }

        return {
            correct: false,
            message: translations[this.language].incorrect,
            progress,
            wrongLetterPosition: result.firstWrongLetter
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

    private renderPreviousWordSets(): string {
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
            Analytics.trackPreviousSetLoad(index);
            this.startGame();
        }
    }

    private renderPractice(): string {
        const currentWord = this.wordList[this.currentIndex];
        const progress = ((this.currentIndex + 1) / this.wordList.length) * 100;
        const t = translations[this.language];
        
        if (!currentWord) {
            return this.renderCompletionScreen();
        }
        
        const input = document.querySelector('#answerInput') as HTMLInputElement;
        const lastAttempt = input?.value.trim() || '';
        const hint = this.attempts[this.currentIndex] > 0 ? this.getNextLetterHint(lastAttempt) : null;
        
        return `
            <div class="card">
                <div class="space-y-6">
                    <div class="flex justify-between items-center">
                        <div>
                            <h2 class="text-lg font-medium">
                                ${t.word} ${this.currentIndex + 1}/${this.wordList.length}
                            </h2>
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
                        <button id="listenButton" class="btn btn-outline" title="${t.listen}">
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
                            class="input text-center text-2xl ${this.currentWordCorrect ? 'bg-green-50' : ''}" 
                            placeholder="${t.typePlaceholder}"
                            ${this.currentWordCorrect ? 'disabled' : ''}
                            autocomplete="off"
                            spellcheck="false"
                            value="${this.currentWordCorrect ? currentWord : ''}"
                        >
                        
                        ${!this.currentWordCorrect ? `
                            <div class="hint text-center">
                                ${t.pressEnter}
                            </div>
                        ` : ''}
                    </div>

                    <div class="space-x-4 flex justify-center">
                        ${this.currentWordCorrect ? `
                            <button id="nextButton" class="btn btn-primary">
                                ${this.currentIndex === this.wordList.length - 1 ? t.finish : t.next}
                            </button>
                        ` : `
                            <button id="checkButton" class="btn btn-primary">
                                ${t.check}
                            </button>
                        `}
                    </div>

                    ${this.currentWordCorrect ? `
                        <div class="success-feedback">
                            <div class="flex items-center justify-center gap-2">
                                <span class="text-lg font-medium text-green-600">${t.correct}</span>
                                ${(() => {
                                    let medal = '';
                                    if (this.attempts[this.currentIndex] === 1) {
                                        medal = '🥇';
                                    } else if (this.attempts[this.currentIndex] === 2) {
                                        medal = '🥈';
                                    } else if (this.attempts[this.currentIndex] === 3) {
                                        medal = '🥉';
                                    }
                                    return medal ? `<span class="text-4xl animate-bounce">${medal}</span>` : '';
                                })()}
                            </div>
                        </div>
                    ` : `
                        <div id="result" class="text-center space-y-4">
                            ${this.attempts[this.currentIndex] > 0 ? `
                                <p class="text-red-500">${t.incorrect}</p>
                                <div class="relative inline-block">
                                    <p class="text-2xl mt-2">${hint?.progress}</p>
                                    ${hint && hint.wrongLetterPosition >= 0 ? `
                                        <div class="absolute" style="left: calc(${hint.wrongLetterPosition}ch + ${hint.wrongLetterPosition * 0.1}em); top: -1.5em">
                                            <span class="text-red-500 text-2xl">↓</span>
                                        </div>
                                    ` : ''}
                                </div>
                                <div class="mt-4 text-sm space-y-1">
                                    <p class="font-medium">${t.feedbackLegend}</p>
                                    <p><span class="text-green-600">■</span> ${t.correctLetters}</p>
                                    <p><span class="text-red-500">■</span> ${t.wrongLetter}</p>
                                    <p><span class="text-gray-400">■</span> ${t.uncheckedLetters}</p>
                                </div>
                            ` : ''}
                        </div>
                    `}
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
            this.showNextWord();
        } else {
            // Show completion screen with confetti
            this.currentIndex++; // Move past the last word to trigger completion screen
            this.createConfetti();
            this.render();
        }
    }

    public startGame(): void {
        const input = document.querySelector('#wordInput') as HTMLTextAreaElement;
        if (!input) return;

        const inputValue = input.value;
        const isValidInput = /^[a-zA-Z,\s\n]+$/.test(inputValue);
        
        if (!isValidInput) {
            input.classList.add('error');
            input.value = '';
            input.placeholder = translations[this.language].onlyEnglishLetters;
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'text-red-500 text-sm mt-1';
            errorDiv.textContent = translations[this.language].onlyEnglishLetters;
            
            const existingError = input.parentElement?.querySelector('.text-red-500');
            if (existingError) {
                existingError.remove();
            }
            
            input.parentElement?.appendChild(errorDiv);
            
            setTimeout(() => {
                input.classList.remove('error');
                errorDiv.remove();
                input.placeholder = translations[this.language].wordsPlaceholder;
            }, 3000);
            
            return;
        }

        const words = inputValue.split(/[\n,]/)
            .map(word => word.trim())
            .filter(word => word && /^[a-zA-Z]+$/.test(word));

        if (words.length > 0) {
            this.savePreviousWordSet(words);
            this.wordList = this.shuffleArray(words);
            this.currentIndex = 0;
            this.attempts = {};
            this.wrongAttempts = {};
            this.showPractice = true;
            Analytics.trackGameStart(this.wordList.length);
            this.showNextWord();
        }
    }

    public toggleLanguage(): void {
        this.language = this.language === 'en' ? 'he' : 'en';
        localStorage.setItem('spellingQuizLanguage', this.language);
        Analytics.trackLanguageChange(this.language);
        this.render();
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
            Analytics.trackWordAttempt(currentWord, userAnswer, true, this.attempts[this.currentIndex]);
        } else {
            if (!this.wrongAttempts[this.currentIndex].includes(userAnswer)) {
                this.wrongAttempts[this.currentIndex].push(userAnswer);
            }
            Analytics.trackWordAttempt(currentWord, userAnswer, false, this.attempts[this.currentIndex]);
            const hint = this.getNextLetterHint(userAnswer);
            input.placeholder = hint.message;
        }
        this.render();
    }
}

// Create and initialize the game instance
declare global {
    interface Window {
        game: SpellingGame;
    }
}

window.game = new SpellingGame();
