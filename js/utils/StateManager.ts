import { GameState, GameProgress, GameScreen, GameSettings } from '../models/GameState.js';
import { StorageService } from '../services/StorageService.js';

type StateChangeCallback = (newState: GameState, oldState: GameState) => void;

/**
 * Manages application state
 */
export class StateManager {
  private static instance: StateManager;
  private state: GameState;
  private subscribers: StateChangeCallback[] = [];

  /**
   * Create a new state manager with initial state
   */
  private constructor() {
    // Get saved settings from storage service
    const storageService = StorageService.getInstance();
    const savedSettings = storageService.getGameSettings();
    
    this.state = {
      settings: {
        language: 'en',
        inputMode: 'manual',
        difficulty: 'medium',
        wordCount: 10,
        ...savedSettings
      },
      screen: 'menu',
      progress: {
        currentIndex: 0,
        wordList: [],
        attempts: {},
        wrongAttempts: {},
        currentWordCorrect: false
      },
      lastPlayTime: 0
    };
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  /**
   * Get the current state
   */
  public getState(): GameState {
    return this.state;
  }

  /**
   * Dispatch an action to update the state
   * @param actionFn Function that returns a partial state to merge
   */
  public dispatch(actionFn: () => Partial<GameState>): void {
    const oldState = { ...this.state };
    const partialState = actionFn();
    this.state = { ...this.state, ...partialState };
    this.notifySubscribers(oldState);
  }
  
  /**
   * Select a specific part of the state
   * @param selectorFn Function that selects a part of the state
   * @returns Selected part of the state
   */
  public select<T>(selectorFn: (state: GameState) => T): T {
    return selectorFn(this.state);
  }

  /**
   * Update settings
   * @param settings Settings to update
   */
  public updateSettings(settings: Partial<GameSettings>): void {
    const oldState = { ...this.state };
    this.state = {
      ...this.state,
      settings: {
        ...this.state.settings,
        ...settings
      }
    };
    this.notifySubscribers(oldState);
  }

  /**
   * Update progress
   * @param progress Progress to update
   */
  public updateProgress(progress: Partial<GameProgress>): void {
    const oldState = { ...this.state };
    this.state = {
      ...this.state,
      progress: {
        ...this.state.progress,
        ...progress
      }
    };
    this.notifySubscribers(oldState);
  }

  /**
   * Reset progress with optional new word list
   * @param wordList Optional word list to initialize with
   */
  public resetProgress(wordList?: string[]): void {
    const oldState = { ...this.state };
    this.state = {
      ...this.state,
      progress: {
        currentIndex: 0,
        wordList: wordList || [],
        attempts: {},
        wrongAttempts: {},
        currentWordCorrect: false
      }
    };
    this.notifySubscribers(oldState);
  }

  /**
   * Set the current screen
   * @param screen Screen to set
   */
  public setScreen(screen: GameScreen): void {
    const oldState = { ...this.state };
    this.state = {
      ...this.state,
      screen
    };
    this.notifySubscribers(oldState);
  }

  /**
   * Update the last time a word was played
   */
  public updateLastPlayTime(): void {
    const oldState = { ...this.state };
    this.state = {
      ...this.state,
      lastPlayTime: Date.now()
    };
    this.notifySubscribers(oldState);
  }

  /**
   * Subscribe to state changes
   * @param callback Callback to call when state changes
   * @returns Unsubscribe function
   */
  public subscribe(callback: StateChangeCallback): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify subscribers of state change
   * @param oldState Previous state
   */
  private notifySubscribers(oldState: GameState): void {
    this.subscribers.forEach(callback => {
      try {
        callback(this.state, oldState);
      } catch (error) {
        console.error('Error in state change subscriber:', error);
      }
    });
  }
}

export default StateManager;