import Component from './Component';
import { GameEngine } from '../core/GameEngine';
import { translations } from '../i18n/translations';
import { StorageService } from '../services/StorageService';
import { Language, InputMode } from '../models/GameState';
import { PreviousWordSet } from '../models/WordModel';

export class MenuComponent extends Component {
  private gameEngine: GameEngine;
  private storageService: StorageService;
  private cleanupHandlers: (() => void)[] = [];
  
  constructor(containerId: string) {
    super(containerId);
    this.gameEngine = GameEngine.getInstance();
    this.storageService = StorageService.getInstance();
  }
  
  /**
   * Renders the menu component
   */
  public render(): void {
    if (!this.element) return;
    
    const state = this.gameEngine.getState();
    const { language, inputMode } = state.settings;
    const t = translations[language];
    
    // Only render when we're on the menu screen
    if (state.screen !== 'menu') return;
    
    const savedDifficulty = state.settings.difficulty;
    const savedWordCount = state.settings.wordCount;
    
    // Render menu HTML
    this.element.innerHTML = `
      <div class="container mx-auto px-4 py-8 max-w-2xl">
        <div class="flex justify-end mb-4">
          <button id="languageToggle" class="btn btn-outline" data-testid="language-toggle">
            ${language === 'he' ? 'English' : 'עברית'}
          </button>
        </div>
        
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
                  <button id="manualMode" class="btn ${inputMode === 'manual' ? 'btn-primary' : 'btn-outline'} flex-1" data-testid="manual-mode-button">
                    ${t.manualEntry}
                  </button>
                  <button id="randomMode" class="btn ${inputMode === 'random' ? 'btn-primary' : 'btn-outline'} flex-1" data-testid="random-mode-button">
                    ${t.randomWords}
                  </button>
                </div>
                
                ${inputMode === 'manual' ? `
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">
                      ${t.enterWords}
                    </label>
                    <textarea id="wordInput" 
                      class="input w-full ltr-input" 
                      placeholder="${t.wordsPlaceholder}"
                      data-testid="word-input"
                      spellcheck="false"
                      autocomplete="off"
                      autocorrect="off"
                      autocapitalize="off"
                    ></textarea>
                  </div>
                ` : `
                  <div class="flex space-x-4">
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
            
            ${this.renderPreviousWordSets(language)}
          </div>
        </div>
      </div>
    `;
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  /**
   * Sets up event listeners for menu interactions
   */
  protected setupEventListeners(): void {
    if (!this.element) return;
    
    // Clean up previous event listeners first
    this.removeEventListeners();
    
    // Language toggle
    const languageToggle = this.getElement('#languageToggle');
    if (languageToggle) {
      const handleLanguageToggle = () => {
        this.gameEngine.toggleLanguage();
      };
      languageToggle.addEventListener('click', handleLanguageToggle);
      this.cleanupHandlers.push(() => languageToggle.removeEventListener('click', handleLanguageToggle));
    }
    
    // Mode toggle buttons
    const manualMode = this.getElement('#manualMode');
    const randomMode = this.getElement('#randomMode');
    
    if (manualMode) {
      const handleManualMode = () => {
        this.gameEngine.setInputMode('manual');
      };
      manualMode.addEventListener('click', handleManualMode);
      this.cleanupHandlers.push(() => manualMode.removeEventListener('click', handleManualMode));
    }
    
    if (randomMode) {
      const handleRandomMode = () => {
        this.gameEngine.setInputMode('random');
      };
      randomMode.addEventListener('click', handleRandomMode);
      this.cleanupHandlers.push(() => randomMode.removeEventListener('click', handleRandomMode));
    }
    
    // Start practice button
    const startPractice = this.getElement('#startPractice');
    if (startPractice) {
      const handleStartPractice = () => this.handleStartPractice();
      startPractice.addEventListener('click', handleStartPractice);
      this.cleanupHandlers.push(() => startPractice.removeEventListener('click', handleStartPractice));
    }
    
    // Word input error handling
    const wordInput = this.getElement<HTMLTextAreaElement>('#wordInput');
    if (wordInput) {
      const handleInput = () => wordInput.classList.remove('error');
      wordInput.addEventListener('input', handleInput);
      this.cleanupHandlers.push(() => wordInput.removeEventListener('input', handleInput));
    }
    
    // Set up event listeners for previous word sets buttons
    const previousSetButtons = this.getAllElements<HTMLButtonElement>('[data-previous-set]');
    previousSetButtons.forEach((button, index) => {
      const handlePreviousSet = () => {
        const setIndex = parseInt(button.getAttribute('data-previous-set') || '0', 10);
        this.gameEngine.loadPreviousSet(setIndex);
      };
      button.addEventListener('click', handlePreviousSet);
      this.cleanupHandlers.push(() => button.removeEventListener('click', handlePreviousSet));
    });
  }
  
  /**
   * Removes all event listeners
   */
  protected removeEventListeners(): void {
    // Execute all cleanup handlers
    this.cleanupHandlers.forEach(cleanup => cleanup());
    this.cleanupHandlers = [];
  }
  
  /**
   * Handles the start practice button click
   */
  private handleStartPractice(): void {
    const state = this.gameEngine.getState();
    const { inputMode } = state.settings;
    
    if (inputMode === 'manual') {
      this.startManualGame();
    } else {
      this.startRandomGame();
    }
  }
  
  /**
   * Starts a game with manually entered words
   */
  private startManualGame(): void {
    const wordInput = this.getElement<HTMLTextAreaElement>('#wordInput');
    if (!wordInput) return;
    
    const wordText = wordInput.value;
    const words = wordText
      .split(/[\n,]/)
      .map(word => word.trim())
      .filter(word => word && /^[a-zA-Z\s]+$/.test(word));
    
    // Validate words
    if (words.length === 0) {
      this.showWordInputError();
      return;
    }
    
    // Start the game
    this.gameEngine.startGame(words);
  }
  
  /**
   * Starts a game with random words based on difficulty settings
   */
  private startRandomGame(): void {
    const difficultySelect = this.getElement<HTMLSelectElement>('#difficulty');
    const wordCountInput = this.getElement<HTMLInputElement>('#wordCount');
    
    if (!difficultySelect || !wordCountInput) return;
    
    const difficulty = difficultySelect.value as 'easy' | 'medium' | 'hard';
    const wordCount = parseInt(wordCountInput.value, 10);
    
    // Update settings in state manager
    this.gameEngine.getState().settings.difficulty = difficulty;
    this.gameEngine.getState().settings.wordCount = wordCount;
    
    // Start game with random words
    this.gameEngine.startRandomGame({
      difficulty,
      count: wordCount
    });
  }
  
  /**
   * Shows an error message when the word input is invalid
   */
  private showWordInputError(): void {
    const wordInput = this.getElement<HTMLTextAreaElement>('#wordInput');
    if (!wordInput) return;
    
    const state = this.gameEngine.getState();
    const language = state.settings.language;
    
    wordInput.classList.add('error');
    wordInput.value = '';
    wordInput.placeholder = translations[language].onlyEnglishLetters;
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-500 text-sm mt-1';
    errorDiv.textContent = translations[language].onlyEnglishLetters;
    
    const existingError = wordInput.parentElement?.querySelector('.text-red-500');
    if (existingError) {
      existingError.remove();
    }
    
    wordInput.parentElement?.appendChild(errorDiv);
    
    // Clear error after 3 seconds
    setTimeout(() => {
      wordInput.classList.remove('error');
      errorDiv.remove();
      wordInput.placeholder = translations[language].wordsPlaceholder;
    }, 3000);
  }
  
  /**
   * Renders the previous word sets section
   * @param language Current language
   * @returns HTML string for previous word sets
   */
  private renderPreviousWordSets(language: Language): string {
    const previousSets = this.storageService.getPreviousWordSets();
    if (previousSets.length === 0) return '';
    
    const t = translations[language];
    
    return `
      <div class="space-y-2">
        <h2 class="text-sm font-medium text-gray-700">${t.previousSets}</h2>
        <div class="space-y-2 flex flex-col items-stretch">
          ${previousSets.map((set, index) => this.renderPreviousSetButton(set, index)).join('')}
        </div>
      </div>
    `;
  }
  
  /**
   * Renders a button for a previous word set
   * @param set Word set data
   * @param index Index of the set
   * @returns HTML string for the button
   */
  private renderPreviousSetButton(set: PreviousWordSet, index: number): string {
    return `
      <button 
        class="btn btn-outline text-left px-4 py-2 w-full self-stretch text-sm"
        data-previous-set="${index}"
        style="text-align: left !important; margin-left: 0 !important;"
      >
        ${set.words.join(', ')}
      </button>
    `;
  }
}

export default MenuComponent;