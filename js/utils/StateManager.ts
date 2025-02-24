import { GameState, GameSettings, GameProgress, GameScreen } from '../models/GameState';

type StateChangeListener = (newState: GameState, oldState: GameState) => void;
type StateSelector<T> = (state: GameState) => T;

export class StateManager {
  private state: GameState;
  private listeners: StateChangeListener[] = [];
  private static instance: StateManager;

  private constructor() {
    this.state = this.getInitialState();
  }

  public static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  private getInitialState(): GameState {
    // Set default values
    const savedLanguage = localStorage.getItem('spellingQuizLanguage');
    const language = (savedLanguage === 'en' || savedLanguage === 'he') ? savedLanguage : 'he';
    
    const savedInputMode = localStorage.getItem('spellingQuizInputMode') as 'manual' | 'random';
    const inputMode = savedInputMode || 'manual';
    
    const savedDifficulty = localStorage.getItem('spellingQuizDifficulty') || 'easy';
    const savedWordCount = localStorage.getItem('spellingQuizWordCount') || '10';
    
    return {
      settings: {
        language,
        inputMode,
        difficulty: savedDifficulty as 'easy' | 'medium' | 'hard',
        wordCount: parseInt(savedWordCount, 10),
      },
      screen: 'menu',
      progress: {
        currentIndex: 0,
        wordList: [],
        attempts: {},
        wrongAttempts: {},
        currentWordCorrect: false,
      },
      lastPlayTime: 0,
    };
  }

  public getState(): GameState {
    return { ...this.state };
  }

  public select<T>(selector: StateSelector<T>): T {
    return selector(this.state);
  }

  public dispatch(action: (state: GameState) => Partial<GameState>): void {
    const oldState = { ...this.state };
    const partialNewState = action(oldState);
    
    // Merge the partial state with the current state
    this.state = {
      ...this.state,
      ...partialNewState,
      settings: {
        ...this.state.settings,
        ...(partialNewState.settings || {}),
      },
      progress: {
        ...this.state.progress,
        ...(partialNewState.progress || {}),
      },
    };
    
    // Notify all listeners
    this.notifyListeners(oldState);
  }

  public subscribe(listener: StateChangeListener): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(oldState: GameState): void {
    this.listeners.forEach(listener => listener(this.state, oldState));
  }
  
  // Convenience methods for common state updates
  public updateSettings(settings: Partial<GameSettings>): void {
    this.dispatch(state => ({
      settings: {
        ...state.settings,
        ...settings,
      }
    }));
  }
  
  public updateProgress(progress: Partial<GameProgress>): void {
    this.dispatch(state => ({
      progress: {
        ...state.progress,
        ...progress,
      }
    }));
  }
  
  public setScreen(screen: GameScreen): void {
    this.dispatch(state => ({ screen }));
  }
  
  public resetProgress(wordList: string[] = []): void {
    this.dispatch(state => ({
      progress: {
        currentIndex: 0,
        wordList,
        attempts: {},
        wrongAttempts: {},
        currentWordCorrect: false,
      }
    }));
  }
  
  public updateLastPlayTime(): void {
    this.dispatch(() => ({
      lastPlayTime: Date.now()
    }));
  }
}

export default StateManager;