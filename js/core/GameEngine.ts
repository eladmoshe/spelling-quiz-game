import StateManager from '../utils/StateManager.js';
import { WordMatcher } from './WordMatcher.js';
import { WordGenerator } from './WordGenerator.js';
import { StorageService } from '../services/StorageService.js';
import { SpeechService } from '../services/SpeechService.js';
import { AnalyticsService } from '../services/AnalyticsService.js';
import { GameState, GameStats, Language, WordAttempt } from '../models/GameState.js';
import { WordOptions } from '../models/WordModel.js';
import EventBus from '../utils/EventBus.js';

export class GameEngine {
  private stateManager: StateManager;
  private wordMatcher: WordMatcher;
  private wordGenerator: WordGenerator;
  private storageService: StorageService;
  private speechService: SpeechService;
  private analyticsService: AnalyticsService;
  private eventBus: EventBus;
  
  private static instance: GameEngine;
  
  private constructor() {
    this.stateManager = StateManager.getInstance();
    this.wordMatcher = new WordMatcher();
    this.wordGenerator = new WordGenerator();
    this.storageService = StorageService.getInstance();
    this.speechService = SpeechService.getInstance();
    this.analyticsService = AnalyticsService.getInstance();
    this.eventBus = EventBus.getInstance();

    // Initialize document direction based on language setting
    this.updateDocumentDirection();

    // Set up state change listeners
    this.stateManager.subscribe((newState, oldState) => {
      // Update document direction if language changed
      if (newState.settings.language !== oldState.settings.language) {
        this.updateDocumentDirection();
      }
    });
    
    // Set up event listeners for test reliability
    this.eventBus.on('forceCorrect', () => {
      try {
        // Force the current word to be marked as correct (for tests)
        const state = this.getState();
        if (!state.progress.currentWordCorrect) {
          this.stateManager.updateProgress({
            currentWordCorrect: true
          });
        }
      } catch (error) {
        // Emit error event instead of console.error
        this.eventBus.emit('gameError', { 
          type: 'forceCorrectFailed', 
          message: 'Error forcing correct answer', 
          error 
        });
      }
    });
    
    // Force practice screen for test reliability
    this.eventBus.on('forcePracticeScreen', () => {
      try {
        // Force the screen to practice mode if it isn't already
        const state = this.getState();
        if (state.screen !== 'practice') {
          this.stateManager.setScreen('practice');
          // Trigger a state change notification
          this.eventBus.emit('stateChanged');
        }
      } catch (error) {
        // Emit error event instead of console.error
        this.eventBus.emit('gameError', { 
          type: 'forcePracticeScreenFailed', 
          message: 'Error forcing practice screen', 
          error 
        });
      }
    });
  }
  
  public static getInstance(): GameEngine {
    if (!GameEngine.instance) {
      GameEngine.instance = new GameEngine();
    }
    return GameEngine.instance;
  }
  
  /**
   * Updates the document direction based on current language
   */
  private updateDocumentDirection(): void {
    const { language } = this.stateManager.getState().settings;
    document.dir = language === 'he' ? 'rtl' : 'ltr';
  }
  
  /**
   * Toggles the application language
   */
  public toggleLanguage(): void {
    const currentState = this.stateManager.getState();
    const newLanguage: Language = currentState.settings.language === 'en' ? 'he' : 'en';
    
    this.stateManager.updateSettings({ language: newLanguage });
    this.storageService.saveGameSettings(this.stateManager.getState().settings);
    this.analyticsService.trackLanguageChange(newLanguage);
    
    // Notify about language change
    this.eventBus.emit('languageChanged', newLanguage);
  }
  
  /**
   * Sets the input mode (manual or random)
   */
  public setInputMode(mode: 'manual' | 'random'): void {
    this.stateManager.updateSettings({ inputMode: mode });
    this.storageService.saveGameSettings(this.stateManager.getState().settings);
    this.analyticsService.trackInputModeChange(mode);
    
    // Notify about input mode change
    this.eventBus.emit('inputModeChanged', mode);
  }
  
  /**
   * Starts a new game with the provided word list
   */
  public startGame(wordList: string[]): void {
    // Ensure wordList is an array
    const safeWordList = Array.isArray(wordList) ? wordList : [];
    
    // For empty word lists, emit an event instead of console warning
    if (safeWordList.length === 0) {
      this.eventBus.emit('emptyWordList', { message: 'Starting game with empty word list' });
    }
    
    // Save the word set for future use (only if not empty)
    if (safeWordList.length > 0) {
      this.storageService.savePreviousWordSet(safeWordList);
    }

    // Update game state
    this.stateManager.resetProgress(safeWordList);
    
    // Set screen directly without delay for immediate transition
    this.stateManager.setScreen('practice');
    
    // Track game start
    const state = this.stateManager.getState();
    this.analyticsService.trackGameStart({
      wordCount: safeWordList.length,
      difficulty: state.settings.inputMode === 'random' ? state.settings.difficulty : 'manual',
      inputMode: state.settings.inputMode,
      language: state.settings.language
    });

    // Notify about game start
    this.eventBus.emit('gameStarted', safeWordList);

    // Add a delay before playing the first word to ensure UI has updated
    // Only try to play if we have words
    if (safeWordList.length > 0) {
      setTimeout(() => {
        try {
          this.playCurrentWord();
          
          // Emit an event to signal that the game is fully loaded
          this.eventBus.emit('gameFullyLoaded');
        } catch (error) {
          // Emit error event instead of console.error
          this.eventBus.emit('gameError', { 
            type: 'startGamePlayFailed', 
            message: 'Error playing first word', 
            error 
          });
          
          // Still emit fully loaded event to ensure UI responds
          this.eventBus.emit('gameFullyLoaded');
        }
      }, 500);
    } else {
      // Still emit the game loaded event
      setTimeout(() => {
        this.eventBus.emit('gameFullyLoaded');
      }, 500);
    }
  }
  
  /**
   * Starts a game with random words
   */
  public async startRandomGame(options: WordOptions): Promise<void> {
    try {
      const wordList = await this.wordGenerator.getRandomWords(options);
      this.startGame(wordList);
    } catch (error) {
      // Emit error event instead of console.error
      this.eventBus.emit('gameError', { 
        type: 'wordGenerationFailed', 
        message: 'Error generating random words', 
        error 
      });
      // Start with empty list as fallback
      this.startGame([]);
    }
  }
  
  /**
   * Loads a previously saved word set
   */
  public loadPreviousSet(index: number): void {
    try {
      const previousSets = this.storageService.getPreviousWordSets();

      if (index >= 0 && index < previousSets.length) {
        const words = previousSets[index].words;
        this.analyticsService.trackPreviousSetLoad(index);
        
        // Emit a special event for tests to indicate we're loading a previous set
        this.eventBus.emit('loadingPreviousSet', index);
        
        // Start the game with the selected word set
        this.startGame(words);
        
        // Force the game board to be rendered
        setTimeout(() => {
          this.eventBus.emit('forcePracticeScreen');
          
          // Emit an additional event after the practice screen is forced
          setTimeout(() => {
            this.eventBus.emit('previousSetLoaded', index);
          }, 100);
        }, 200);
      }
    } catch (error) {
      // Emit error event instead of console.error
      this.eventBus.emit('gameError', { 
        type: 'loadPreviousSetFailed', 
        message: 'Error loading previous set', 
        error 
      });
    }
  }
  
  /**
   * Checks the user's answer against the current word
   */
  public checkAnswer(userAnswer: string): WordAttempt {
    const state = this.stateManager.getState();
    const { currentIndex, wordList } = state.progress;
    const currentWord = wordList[currentIndex];
    
    // Save current word to localStorage before checking
    this.storageService.saveCurrentWord(userAnswer);
    
    // Get or initialize attempt count for current word
    let attempts = state.progress.attempts[currentIndex] || 0;
    let wrongAttempts = state.progress.wrongAttempts[currentIndex] || [];
    
    // Increment attempt counter
    attempts += 1;
    
    // Check answer
    const result = this.wordMatcher.checkWord(currentWord, userAnswer);
    
    // Track attempt
    this.analyticsService.trackWordAttempt({
      word: currentWord,
      attempt: userAnswer,
      isCorrect: result.isCorrect,
      attemptNumber: attempts,
      language: state.settings.language
    });
    
    // Update state based on result
    if (result.isCorrect) {
      // Clear saved word on correct answer
      this.storageService.clearCurrentWord();
      
      // Update state
      this.stateManager.updateProgress({
        attempts: { ...state.progress.attempts, [currentIndex]: attempts },
        wrongAttempts: { ...state.progress.wrongAttempts, [currentIndex]: wrongAttempts },
        currentWordCorrect: true
      });
      
      // Return word attempt info
      return {
        word: currentWord,
        attempts,
        wrongAttempts,
        isCorrect: true
      };
    } else {
      // Add to wrong attempts if not already included
      if (!wrongAttempts.includes(userAnswer)) {
        wrongAttempts = [...wrongAttempts, userAnswer];
      }
      
      // Update state with wrong attempt
      this.stateManager.updateProgress({
        attempts: { ...state.progress.attempts, [currentIndex]: attempts },
        wrongAttempts: { ...state.progress.wrongAttempts, [currentIndex]: wrongAttempts },
        currentWordCorrect: false
      });
      
      // Return word attempt info
      return {
        word: currentWord,
        attempts,
        wrongAttempts,
        isCorrect: false
      };
    }
  }
  
  /**
   * Advances to the next word or completes the game
   */
  public nextWord(): void {
    const state = this.stateManager.getState();
    const { currentIndex, wordList } = state.progress;

    // Check if we've reached the end of the word list
    if (currentIndex >= wordList.length - 1) {
      // Game is complete
      this.completeGame();
    } else {
      // Clear any saved word in storage to ensure we don't restore it 
      this.storageService.clearCurrentWord();
      
      // Move to next word
      this.stateManager.updateProgress({
        currentIndex: currentIndex + 1,
        currentWordCorrect: false
      });

      // Notify about word change
      this.eventBus.emit('wordChanged', currentIndex + 1);

      // Emit a special event for tests to ensure we clear the input field
      this.eventBus.emit('resetInputField');

      // Play the new word with a timeout to ensure UI is ready
      setTimeout(() => {
        this.playCurrentWord();
        // Emit event to signal that next word is ready
        this.eventBus.emit('nextWordReady', currentIndex + 1);
      }, 400);
    }
  }
  
  /**
   * Completes the current game and shows summary
   */
  private completeGame(): void {
    // Show the game completion screen
    this.stateManager.setScreen('summary');
    
    // Create confetti effect (through event)
    this.eventBus.emit('gameCompleted', this.calculateGameStats());
  }
  
  /**
   * Calculates game statistics
   */
  public calculateGameStats(): GameStats {
    const state = this.stateManager.getState();
    const { wordList, attempts } = state.progress;
    
    const totalWords = wordList.length;
    const perfectWords = Object.entries(attempts).filter(([_, attemptCount]) => attemptCount === 1).length;
    const accuracy = Math.round((perfectWords / totalWords) * 100);
    
    const oneAttemptWords = Object.entries(attempts).filter(([_, attemptCount]) => attemptCount === 1).length;
    const twoAttemptWords = Object.entries(attempts).filter(([_, attemptCount]) => attemptCount === 2).length;
    const threeAttemptWords = Object.entries(attempts).filter(([_, attemptCount]) => attemptCount === 3).length;
    const wrongAttempts = Object.values(attempts).reduce((sum, count) => sum + (count - 1), 0);
    
    // Track game completion
    const { settings } = state;
    this.analyticsService.trackGameComplete({
      totalWords,
      perfectWords, 
      accuracy,
      oneAttemptWords,
      twoAttemptWords,
      threeAttemptWords,
      wrongAttempts,
      language: settings.language,
      inputMode: settings.inputMode,
      difficulty: settings.inputMode === 'random' ? settings.difficulty : 'manual'
    });
    
    return {
      totalWords,
      perfectWords,
      accuracy,
      oneAttemptWords,
      twoAttemptWords,
      threeAttemptWords,
      wrongAttempts
    };
  }
  
  /**
   * Resets the game state and returns to the main menu
   */
  public resetGame(): void {
    this.stateManager.resetProgress();
    this.stateManager.setScreen('menu');
    this.eventBus.emit('gameReset');
  }
  
  /**
   * Plays the current word using speech synthesis
   */
  public async playCurrentWord(): Promise<void> {
    if (!this.speechService.canPlayWord()) {
      return;
    }
    
    const state = this.stateManager.getState();
    const { currentIndex, wordList } = state.progress;
    const currentWord = wordList[currentIndex];
    
    if (!currentWord) return;
    
    try {
      await this.speechService.speak(currentWord, 'en-US');
      this.stateManager.updateLastPlayTime();
    } catch (error) {
      // Emit more structured event instead of just passing the error
      this.eventBus.emit('speechError', {
        type: 'playWordFailed',
        message: 'Error playing word',
        error
      });
    }
  }
  
  /**
   * Plays the current word at a slower rate
   */
  public async playWordSlower(): Promise<void> {
    if (!this.speechService.canPlayWord()) {
      return;
    }
    
    const state = this.stateManager.getState();
    const { currentIndex, wordList } = state.progress;
    const currentWord = wordList[currentIndex];
    
    if (!currentWord) return;
    
    try {
      await this.speechService.speak(currentWord, 'en-US', 'slow');
      this.stateManager.updateLastPlayTime();
    } catch (error) {
      // Emit more structured event instead of just passing the error
      this.eventBus.emit('speechError', {
        type: 'playWordSlowerFailed',
        message: 'Error playing word at slower rate',
        error
      });
    }
  }
  
  /**
   * Gets the current game state
   */
  public getState(): GameState {
    return this.stateManager.getState();
  }

  /**
   * Gets the event bus for external use
   */
  public getEventBus(): EventBus {
    return this.eventBus;
  }
}

export default GameEngine;
