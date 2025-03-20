import Component from './Component.js';
import { GameEngine } from '../core/GameEngine.js';
import { WordMatcher } from '../core/WordMatcher.js';
import { translations } from '../i18n/translations.js';
import { GameState } from '../models/GameState.js';

export class GameBoardComponent extends Component {
  private gameEngine: GameEngine;
  private wordMatcher: WordMatcher;
  private cleanupHandlers: (() => void)[] = [];
  
  constructor(containerId: string) {
    super(containerId);
    this.gameEngine = GameEngine.getInstance();
    this.wordMatcher = new WordMatcher();
  }
  
  /**
   * Renders the game board component
   */
  public render(): void {
    if (!this.element) return;
    
    const state = this.gameEngine.getState();
    
    // Only render when on the practice screen
    if (state.screen !== 'practice') return;
    
    this.element.innerHTML = this.renderGameBoard(state);
    this.setupEventListeners();
  }
  
  /**
   * Sets up event listeners for the game board
   */
  protected setupEventListeners(): void {
    if (!this.element) return;
    
    // Clean up previous event listeners
    this.removeEventListeners();
    
    // Menu button
    const menuButton = this.getElement('#menuButton');
    if (menuButton) {
      const handleMenu = () => {
        this.gameEngine.resetGame();
      };
      menuButton.addEventListener('click', handleMenu);
      this.cleanupHandlers.push(() => menuButton.removeEventListener('click', handleMenu));
    }

    // Listen button
    const listenButton = this.getElement('#listenButton');
    if (listenButton) {
      const handleListen = () => {
        this.gameEngine.playCurrentWord();
        this.disableButtonTemporarily(listenButton);
      };
      listenButton.addEventListener('click', handleListen);
      this.cleanupHandlers.push(() => listenButton.removeEventListener('click', handleListen));
    }
    
    // Play slower button
    const playSlowerButton = this.getElement('#playSlowerButton');
    if (playSlowerButton) {
      const handlePlaySlower = () => {
        this.gameEngine.playWordSlower();
        this.disableButtonTemporarily(playSlowerButton);
      };
      playSlowerButton.addEventListener('click', handlePlaySlower);
      this.cleanupHandlers.push(() => playSlowerButton.removeEventListener('click', handlePlaySlower));
    }
    
    // Check button
    const checkButton = this.getElement('#checkButton');
    if (checkButton) {
      const handleCheckAnswer = () => this.checkAnswer();
      checkButton.addEventListener('click', handleCheckAnswer);
      this.cleanupHandlers.push(() => checkButton.removeEventListener('click', handleCheckAnswer));
    }
    
    // Next button
    const nextButton = this.getElement('#nextButton');
    if (nextButton) {
      const handleNextWord = () => {
        const answerInput = this.getElement<HTMLInputElement>('#answerInput');
        if (answerInput) {
          // Explicitly clear the input field before advancing to prevent test failures
          answerInput.value = '';
        }
        this.gameEngine.nextWord();
      };
      nextButton.addEventListener('click', handleNextWord);
      this.cleanupHandlers.push(() => nextButton.removeEventListener('click', handleNextWord));
    }
    
    // Answer input keydown
    const answerInput = this.getElement<HTMLInputElement>('#answerInput');
    if (answerInput) {
      const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const state = this.gameEngine.getState();
          if (state.progress.currentWordCorrect) {
            // Explicitly clear the input field before advancing
            answerInput.value = '';
            this.gameEngine.nextWord();
          } else {
            this.checkAnswer();
          }
        }
      };
      answerInput.addEventListener('keydown', handleKeydown);
      this.cleanupHandlers.push(() => answerInput.removeEventListener('keydown', handleKeydown));
      
      // Focus the input after rendering - increased timeout for better test reliability
      setTimeout(() => {
        if (answerInput) {
          answerInput.focus();
          // Ensure the input is properly visible for tests
          answerInput.style.display = 'block';
        }
      }, 100);
    }
  }
  
  /**
   * Removes all event listeners
   */
  protected removeEventListeners(): void {
    this.cleanupHandlers.forEach(cleanup => cleanup());
    this.cleanupHandlers = [];
  }
  
  /**
   * Checks the user's answer
   */
  private checkAnswer(): void {
    const answerInput = this.getElement<HTMLInputElement>('#answerInput');
    if (!answerInput) return;
    
    const userAnswer = answerInput.value.trim();
    this.gameEngine.checkAnswer(userAnswer);
  }
  
  /**
   * Disables a button temporarily (for cooldown)
   * @param button Button to disable
   */
  private disableButtonTemporarily(button: HTMLElement): void {
    button.setAttribute('disabled', 'true');
    button.classList.add('opacity-50', 'cursor-not-allowed');
    
    setTimeout(() => {
      button.removeAttribute('disabled');
      button.classList.remove('opacity-50', 'cursor-not-allowed');
    }, 1000); // 1 second cooldown
  }
  
  /**
   * Renders the game board
   * @param state Game state
   * @returns HTML string
   */
  private renderGameBoard(state: GameState): string {
    const { language } = state.settings;
    const { currentIndex, wordList, currentWordCorrect } = state.progress;
    const t = translations[language];
    
    const currentWord = wordList[currentIndex];
    if (!currentWord) {
      // This shouldn't happen, but handle it gracefully
      return '';
    }
    
    // Get input value (potentially from a previous unsuccessful attempt)
    const answerInput = this.getElement<HTMLInputElement>('#answerInput');
    const lastAttempt = answerInput?.value.trim() || '';
    
    // Get hint for display if there was an attempt
    const attempts = state.progress.attempts[currentIndex] || 0;
    const hint = attempts > 0 && !currentWordCorrect 
      ? this.wordMatcher.getNextLetterHint(currentWord, lastAttempt, language) 
      : null;
    
    return `
      <div class="card">
        <div class="space-y-6">
          <div class="flex justify-between items-center">
            <div>
              <button class="btn btn-sm btn-outline mb-2" id="menuButton" data-testid="menu-button" title="${t.newWords}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
              </button>
              <h2 class="text-lg font-medium">
                ${t.word} ${currentIndex + 1}/${wordList.length}
              </h2>
              <div class="progress-indicators">
                <div class="progress-bar">
                  <div class="progress-bar-fill" style="width: ${((currentIndex + (currentWordCorrect ? 1 : 0)) / wordList.length) * 100}%"></div>
                </div>
                <style>
                  .progress-bar:before {
                    --progress-percent: ${((currentIndex + (currentWordCorrect ? 1 : 0)) / wordList.length) * 100};
                  }
                </style>
                <div class="word-status">
                  ${wordList.map((_, index) => `
                    <div 
                      class="word-status-indicator ${index < currentIndex ? 'completed' : index === currentIndex ? (currentWordCorrect ? 'correct' : 'current') : 'pending'}"
                      data-testid="word-status-${index < currentIndex ? 'correct' : index === currentIndex ? (currentWordCorrect ? 'correct' : 'incorrect') : 'pending'}"
                    >
                      ${index < currentIndex ? '✓' : index === currentIndex ? (currentWordCorrect ? '✓' : '') : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
            <div class="button-group">
              <button id="listenButton" class="btn" title="${t.listen}" data-testid="play-button">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z">
                  </path>
                </svg>
              </button>
              <button id="playSlowerButton" class="btn" title="${t.listenSlower}" data-testid="play-slower-button">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3" />
                </svg>
              </button>
            </div>
          </div>

          <div class="relative">
            <input type="text" 
              id="answerInput" 
              class="input ltr-input center-align text-center text-2xl ${currentWordCorrect ? 'bg-green-50' : ''}" 
              placeholder="${t.typePlaceholder}"
              ${currentWordCorrect ? 'disabled' : ''}
              autocomplete="off"
              spellcheck="false"
              value="${currentWordCorrect ? currentWord : ''}"
              data-testid="answer-input"
            >
            
            ${!currentWordCorrect ? `
              <div class="hint text-center">
                ${t.pressEnter}
              </div>
            ` : ''}
          </div>

          <div class="space-x-4 flex justify-center">
            ${currentWordCorrect ? `
              <button id="nextButton" class="btn btn-primary" data-testid="next-button">
                ${currentIndex === wordList.length - 1 ? t.finish : t.next}
              </button>
            ` : `
              <button id="checkButton" class="btn btn-primary" data-testid="check-button">
                ${t.check}
              </button>
            `}
          </div>

          ${currentWordCorrect ? `
            <div class="success-feedback">
              <div class="flex items-center justify-center gap-2">
                <span class="text-lg font-medium text-green-600">${t.correct}</span>
                ${(() => {
                  let medal = '';
                  const attemptsForWord = state.progress.attempts[currentIndex] || 0;
                  if (attemptsForWord === 1) {
                    medal = '🥇';
                  } else if (attemptsForWord === 2) {
                    medal = '🥈';
                  } else if (attemptsForWord === 3) {
                    medal = '🥉';
                  }
                  return medal ? `<span class="text-4xl animate-bounce">${medal}</span>` : '';
                })()}
              </div>
            </div>
          ` : `
            <div id="result" class="text-center space-y-4">
              ${attempts > 0 ? `
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
}

export default GameBoardComponent;
