import WordMatcher from './wordMatcher.js';
import { translations } from './translations.js';
import { Analytics } from './analytics.js';
import { WordGenerator, WordOptions } from './wordGenerator.js';

declare global {
    interface Window {
        game: SpellingGame;
    }
}

type Language = 'en' | 'he';
type InputMode = 'manual' | 'random';

export class SpellingGame {
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
    private readonly CURRENT_WORD_KEY = 'currentWord';

    constructor() {
        // Restore game settings from localStorage
        const savedLanguage = localStorage.getItem('spellingQuizLanguage');
        this.language = (savedLanguage === 'en' || savedLanguage === 'he') ? savedLanguage : 'he';

        // Restore input mode
        const savedInputMode = localStorage.getItem('spellingQuizInputMode') as InputMode;
        this.inputMode = savedInputMode || 'manual';

        // Set initial document direction
        document.dir = this.language === 'he' ? 'rtl' : 'ltr';
        const appElement = document.getElementById('app');
        if (!appElement) {
            throw new Error('App element not found');
        }
        this.app = appElement;
        this.wordMatcher = new WordMatcher();
        this.wordGenerator = new WordGenerator();

        // Ensure the initial render and event listeners are set up correctly
        this.render().then(() => {
            this.setupEventListeners();
        });
    }

    private saveGameSettings(): void {
        // Save language
        localStorage.setItem('spellingQuizLanguage', this.language);

        // Save input mode
        localStorage.setItem('spellingQuizInputMode', this.inputMode);

        // If in random mode, save difficulty and word count
        if (this.inputMode === 'random') {
            const difficultySelect = document.getElementById('difficulty') as HTMLSelectElement;
            const wordCountInput = document.getElementById('wordCount') as HTMLInputElement;

            if (difficultySelect) {
                localStorage.setItem('spellingQuizDifficulty', difficultySelect.value);
            }
            if (wordCountInput) {
                localStorage.setItem('spellingQuizWordCount', wordCountInput.value);
            }
        }
    }

    private async render(): Promise<void> {
        const t = translations[this.language];
        const savedDifficulty = localStorage.getItem('spellingQuizDifficulty') || 'easy';
        const savedWordCount = localStorage.getItem('spellingQuizWordCount') || '10';

        this.app.innerHTML = `
            <div class="container mx-auto px-4 py-8 max-w-2xl">
                <div class="flex justify-end mb-4">
                    <button id="languageToggle" class="btn btn-outline" data-testid="language-toggle">
                        ${this.language === 'he' ? 'English' : 'עברית'}
                    </button>
                </div>
                
                ${!this.showPractice ? `
                    <div class="card">
                        <div class="space-y-6">
                            <div class="text-center">
                                <h1 class="title" data-testid="game-title">
                                    ${t.title}
                                </h1>
                            </div>
                            
                            <div class="space-y-4">
                                <div class="space-y-2">
                                    <label class="block text-sm font-medium text-gray-700">
                                        ${t.selectMode}
                                    </label>
                                    <div class="mode-toggle-container flex space-x-4 mb-4">
                                        <button id="manualMode" class="btn ${this.inputMode === 'manual' ? 'btn-primary' : 'btn-outline'} flex-1" data-testid="manual-mode-button">
                                            ${t.manualEntry}
                                        </button>
                                        <button id="randomMode" class="btn ${this.inputMode === 'random' ? 'btn-primary' : 'btn-outline'} flex-1" data-testid="random-mode-button">
                                            ${t.randomWords}
                                        </button>
                                    </div>
                                    
                                    ${this.inputMode === 'manual' ? `
                                        <div class="space-y-2">
                                            <label class="block text-sm font-medium text-gray-700">
                                                ${t.enterWords}
                                            </label>
                                            <textarea id="wordInput" 
                                                class="input w-full ltr-input" 
                                                placeholder="${t.wordsPlaceholder}"
                                                data-testid="word-input"
                                                spellcheck="false"
                                            ></textarea>
                                        </div>
                                    ` : `
                                        <div class="space-y-4">
                                            <div class="flex-1">
                                                <label class="block text-sm font-medium text-gray-700">
                                                    ${t.difficulty}
                                                </label>
                                                <select id="difficulty" class="input w-full" data-testid="difficulty-select">
                                                    <option value="easy" ${savedDifficulty === 'easy' ? 'selected' : ''}>${t.easy}</option>
                                                    <option value="medium" ${savedDifficulty === 'medium' ? 'selected' : ''}>${t.medium}</option>
                                                    <option value="hard" ${savedDifficulty === 'hard' ? 'selected' : ''}>${t.hard}</option>
                                                </select>
                                            </div>
                                            
                                            <div class="flex-1">
                                                <label class="block text-sm font-medium text-gray-700">
                                                    ${t.wordCount}
                                                </label>
                                                <input type="number" id="wordCount" min="1" max="20" value="${savedWordCount}" 
                                                    class="input w-full" data-testid="word-count-input">
                                            </div>
                                        </div>
                                    `}
                                    
                                    <button id="startPractice" class="btn btn-primary w-full mt-4" data-testid="start-button">
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

        // Load current word from localStorage if it exists
        const storedCurrentWord = this.getCurrentWordFromStorage();
        if (storedCurrentWord) {
            const input = document.querySelector('#answerInput') as HTMLInputElement;
            if (input) {
                input.value = storedCurrentWord;
            }
        }

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // Remove any existing event listeners first
        const existingLanguageToggle = document.getElementById('languageToggle');
        if (existingLanguageToggle) {
            const oldToggle = existingLanguageToggle.cloneNode(true);
            existingLanguageToggle.parentNode?.replaceChild(oldToggle, existingLanguageToggle);
        }

        const languageToggle = document.getElementById('languageToggle');
        if (languageToggle) {
            languageToggle.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent event bubbling
                this.toggleLanguage();
                this.saveGameSettings(); // Save settings when language changes
            }, { once: false }); // Ensure the listener can be called multiple times
        }

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
                this.saveGameSettings(); // Save input mode
                this.render();
            });

            randomMode?.addEventListener('click', () => {
                this.inputMode = 'random';
                this.saveGameSettings(); // Save input mode
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

                    // Save the word set when starting a manual game
                    this.savePreviousWordSet(words);
                    this.wordList = words;
                } else {
                    const difficulty = difficultySelect.value as 'easy' | 'medium' | 'hard';
                    const wordCount = parseInt(wordCountInput.value, 10);

                    const wordOptions: WordOptions = {
                        difficulty,
                        count: wordCount
                    };

                    this.wordList = await this.wordGenerator.getRandomWords(wordOptions);

                    // Save difficulty and word count for random mode
                    this.saveGameSettings();
                }

                this.showPractice = true;
                this.currentIndex = 0;
                this.attempts = {};
                this.wrongAttempts = {};
                this.currentWordCorrect = false;
                this.render();
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
            console.log('Attempting Azure TTS for word:', currentWord);
            // Import the speak function dynamically
            const { speak } = await import('./services/speech.js');

            // Always use en-US since we block Hebrew words in the UI
            await speak(currentWord, 'en-US');
            console.log('Azure TTS played successfully');
        } catch (error) {
            console.error('Azure TTS failed:', error);

            // Fallback to browser speech synthesis
            const utterance = new SpeechSynthesisUtterance(currentWord);
            utterance.lang = this.language;
            window.speechSynthesis.speak(utterance);
            console.log('Fallback to browser TTS');
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
        const t = translations[this.language];

        if (!currentWord) {
            const totalWords = this.wordList.length;
            const perfectWords = Object.entries(this.attempts).filter(([_, attempts]) => attempts === 1).length;
            const accuracy = Math.round((perfectWords / totalWords) * 100);

            // Ensure no undefined values
            const getMedal = () => {
                if (isNaN(accuracy)) return '🌱 Start Practicing! 🌈';
                if (accuracy >= 90) return '🏆 Excellent! 🥇';
                if (accuracy >= 70) return '🎉 Great Job! 🥈';
                if (accuracy >= 50) return '👏 Good Effort! 🥉';
                return '🌱 Keep Practicing! 🌈';
            };

            const medalDetails = {
                perfectWords: Object.entries(this.attempts || {}).filter(([_, attempts]) => attempts === 1).length,
                oneAttemptWords: Object.entries(this.attempts || {}).filter(([_, attempts]) => attempts === 1).length,
                twoAttemptWords: Object.entries(this.attempts || {}).filter(([_, attempts]) => attempts === 2).length,
                threeAttemptWords: Object.entries(this.attempts || {}).filter(([_, attempts]) => attempts === 3).length,
            };

            return `
                <div class="card summary-card">
                    <div class="space-y-6">
                        <h2 class="text-3xl font-bold text-center text-primary">${t.practiceComplete}</h2>
                        <p class="text-center text-xl text-text-light">${t.greatJob}</p>
                        
                        <div class="medal-banner">
                            <div class="medal-display">
                                ${getMedal()}
                            </div>
                        </div>

                        <div class="stats grid grid-cols-3 gap-4">
                            <div class="stat-item text-center">
                                <div class="stat-value text-3xl text-primary">${totalWords || 0}</div>
                                <div class="stat-label text-text-light">${t.totalWords}</div>
                            </div>
                            <div class="stat-item text-center">
                                <div class="stat-value text-3xl text-success">${medalDetails.perfectWords || 0}</div>
                                <div class="stat-label text-text-light">${t.perfectWords}</div>
                            </div>
                            <div class="stat-item text-center">
                                <div class="stat-value text-3xl text-secondary">${!isNaN(accuracy) ? `${accuracy}%` : '0%'}</div>
                                <div class="stat-label text-text-light">${t.accuracy}</div>
                            </div>
                        </div>

                        <div class="medal-breakdown">
                            <h3 class="text-xl font-semibold text-center mb-4">${t.wordAttemptBreakdown}</h3>
                            <div class="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <span class="text-3xl">🥇</span>
                                    <div class="text-lg">${medalDetails.oneAttemptWords || 0}</div>
                                    <div class="text-sm text-text-light">First Try</div>
                                </div>
                                <div>
                                    <span class="text-3xl">🥈</span>
                                    <div class="text-lg">${medalDetails.twoAttemptWords || 0}</div>
                                    <div class="text-sm text-text-light">Second Try</div>
                                </div>
                                <div>
                                    <span class="text-3xl">🥉</span>
                                    <div class="text-lg">${medalDetails.threeAttemptWords || 0}</div>
                                    <div class="text-sm text-text-light">Third Try</div>
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-center space-x-4">
                            <button id="startOver" class="btn btn-primary" data-testid="start-over-button">
                                ${t.startOver}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        const progress = ((this.currentIndex + 1) / this.wordList.length) * 100;
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
                                    <div 
                                        class="w-2 h-2 rounded-full ${index < this.currentIndex ? 'bg-green-500' : index === this.currentIndex ? (this.currentWordCorrect ? 'bg-green-500' : 'bg-red-500') : 'bg-gray-400'}" 
                                        data-testid="word-status-${index < this.currentIndex ? 'correct' : index === this.currentIndex ? (this.currentWordCorrect ? 'correct' : 'incorrect') : 'pending'}"
                                    ></div>
                                `).join('')}
                            </div>
                        </div>
                        <button id="listenButton" class="btn btn-outline" title="${t.listen}" data-testid="listen-button">
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
                            class="input ltr-input center-align text-center text-2xl ${this.currentWordCorrect ? 'bg-green-50' : ''}" 
                            placeholder="${t.typePlaceholder}"
                            ${this.currentWordCorrect ? 'disabled' : ''}
                            autocomplete="off"
                            spellcheck="false"
                            value="${this.currentWordCorrect ? currentWord : ''}"
                            data-testid="answer-input"
                        >
                        
                        ${!this.currentWordCorrect ? `
                            <div class="hint text-center">
                                ${t.pressEnter}
                            </div>
                        ` : ''}
                    </div>

                    <div class="space-x-4 flex justify-center">
                        ${this.currentWordCorrect ? `
                            <button id="nextButton" class="btn btn-primary" data-testid="next-button">
                                ${this.currentIndex === this.wordList.length - 1 ? t.finish : t.next}
                            </button>
                        ` : `
                            <button id="checkButton" class="btn btn-primary" data-testid="check-button">
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
                                    <p class="text-2xl mt-2 ltr-input">${hint?.progress}</p>
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
        const input = document.querySelector('#wordInput') as HTMLInputElement;
        if (!input) {
            return;
        }

        const inputValue = input.value.trim();
        if (inputValue.length === 0) {
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
        // Set document direction based on language
        document.dir = this.language === 'he' ? 'rtl' : 'ltr';
        Analytics.trackLanguageChange(this.language);
        this.render();
    }

    public getLanguage(): Language {
        return this.language;
    }

    private saveCurrentWord(word: string): void {
        localStorage.setItem(this.CURRENT_WORD_KEY, word);
    }

    private getCurrentWordFromStorage(): string | null {
        return localStorage.getItem(this.CURRENT_WORD_KEY);
    }

    private clearCurrentWord(): void {
        localStorage.removeItem(this.CURRENT_WORD_KEY);
    }

    private checkAnswer(): void {
        const input = document.querySelector('#answerInput') as HTMLInputElement;
        if (!input) return;

        const currentWord = this.wordList[this.currentIndex];
        const userAnswer = input.value.trim();

        // Save current word to localStorage before checking
        this.saveCurrentWord(userAnswer);

        if (!this.attempts[this.currentIndex]) {
            this.attempts[this.currentIndex] = 0;
            this.wrongAttempts[this.currentIndex] = [];
        }
        this.attempts[this.currentIndex]++;

        const result = this.wordMatcher.checkWord(currentWord, userAnswer);

        if (result.isCorrect) {
            // Clear localStorage when word is correct
            this.clearCurrentWord();
            this.currentWordCorrect = true;
            input.value = currentWord;
            Analytics.trackWordAttempt(currentWord, userAnswer, true, this.attempts[this.currentIndex]);
        } else {
            // Keep the word in localStorage if incorrect
            this.currentWordCorrect = false;
            if (!this.wrongAttempts[this.currentIndex].includes(userAnswer)) {
                this.wrongAttempts[this.currentIndex].push(userAnswer);
            }
            Analytics.trackWordAttempt(currentWord, userAnswer, false, this.attempts[this.currentIndex]);
            const hint = this.getNextLetterHint(userAnswer);
            input.placeholder = hint.message;
        }

        // Render and reset input
        this.render().then(() => {
            const resetInput = document.querySelector('#answerInput') as HTMLInputElement;
            if (resetInput) {
                resetInput.focus();
            }
        });
    }
}

// Create and initialize the game instance only in browser environment
if (typeof window !== 'undefined' && typeof process === 'undefined') {
    window.game = new SpellingGame();
}

document.addEventListener('DOMContentLoaded', () => {
    const feedbackButton = document.getElementById('feedbackButton');
    const feedbackPanel = document.getElementById('feedbackPanel');

    if (feedbackButton && feedbackPanel) {
        // Update feedback panel content based on current language
        const updateFeedbackPanel = () => {
            // Safely access the current language
            const currentLanguage = window.game && window.game.getLanguage() ? window.game.getLanguage() : 'en';
            const t = translations[currentLanguage];
            feedbackPanel.innerHTML = `
                <h3>${t.title}</h3>
                <p>Written by Elad Moshe</p>
                <a href="mailto:eladmoshe@gmail.com">${t.sendFeedback || 'Send Feedback'}</a>
            `;
        };

        // Initial setup
        updateFeedbackPanel();

        // Add click event listener with rotation
        feedbackButton.addEventListener('click', () => {
            // Add rotate class
            feedbackButton.classList.add('rotate');

            // Toggle panel visibility
            feedbackPanel.classList.toggle('visible');

            // Remove rotate class after animation completes
            setTimeout(() => {
                feedbackButton.classList.remove('rotate');
            }, 500); // Match the animation duration
        });

        // Close panel when clicking outside
        document.addEventListener('click', (event) => {
            if (
                feedbackPanel.classList.contains('visible') &&
                !feedbackButton.contains(event.target as Node) &&
                !feedbackPanel.contains(event.target as Node)
            ) {
                feedbackPanel.classList.remove('visible');
            }
        });

        // Listen for language changes
        const originalToggleLanguage = window.game.toggleLanguage;
        window.game.toggleLanguage = function () {
            originalToggleLanguage.call(window.game);
            updateFeedbackPanel();
        };
    }
});
