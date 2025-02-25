import { GameStartParams, GameStats, InputMode, Language } from '../models/GameState';

// Global type definitions for analytics services
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    clarity: {
      (command: 'consent' | 'log' | 'identify', ...args: any[]): void;
    };
  }
}

export interface WordAttemptData {
  word: string;
  attempt: string;
  isCorrect: boolean;
  attemptNumber: number;
  language: string;
}

export class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Generic method to track events in Google Analytics
   * @param eventName Event name
   * @param params Event parameters
   */
  private trackEvent(eventName: string, params: Record<string, any>): void {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', eventName, params);
    }
  }

  /**
   * Track game start event
   * @param params Game start parameters
   */
  public trackGameStart(params: GameStartParams): void {
    // Google Analytics tracking
    this.trackEvent('game_start', {
      word_count: params.wordCount,
      difficulty: params.difficulty,
      input_mode: params.inputMode,
      language: params.language
    });

    // Microsoft Clarity logging
    this.logClarityEvent('game_start', params);
  }

  /**
   * Track game completion event
   * @param stats Game statistics
   */
  public trackGameComplete(stats: GameStats & { 
    language: Language, 
    inputMode: InputMode, 
    difficulty: string 
  }): void {
    // Google Analytics tracking
    this.trackEvent('game_complete', {
      total_words: stats.totalWords,
      perfect_words: stats.perfectWords,
      accuracy: stats.accuracy,
      language: stats.language,
      input_mode: stats.inputMode,
      difficulty: stats.difficulty,
      wrong_attempts: stats.wrongAttempts
    });

    // Microsoft Clarity logging
    this.logClarityEvent('game_complete', stats);
  }

  /**
   * Track word attempt event
   * @param params Word attempt parameters
   */
  public trackWordAttempt(params: WordAttemptData): void {
    this.trackEvent('word_attempt', {
      word: params.word,
      attempt: params.attempt,
      is_correct: params.isCorrect,
      attempt_number: params.attemptNumber,
      language: params.language
    });
  }

  /**
   * Track language change event
   * @param newLanguage New language code
   */
  public trackLanguageChange(newLanguage: string): void {
    this.trackEvent('language_change', { language: newLanguage });
  }

  /**
   * Track previous word set loading
   * @param setIndex Index of the loaded word set
   */
  public trackPreviousSetLoad(setIndex: number): void {
    this.trackEvent('previous_set_load', { set_index: setIndex });
  }

  /**
   * Track input mode change
   * @param newMode New input mode
   */
  public trackInputModeChange(newMode: InputMode): void {
    this.trackEvent('input_mode_change', { input_mode: newMode });
  }

  /**
   * Track difficulty change
   * @param difficulty New difficulty level
   */
  public trackDifficultyChange(difficulty: string): void {
    this.trackEvent('difficulty_change', { difficulty });
  }

  // Microsoft Clarity specific methods

  /**
   * Configure Microsoft Clarity consent
   * @param isConsented Whether user has granted consent
   */
  public configureClarityConsent(isConsented: boolean = true): void {
    if (typeof window.clarity !== 'undefined') {
      window.clarity('consent', isConsented ? 'granted' : 'denied');
    }
  }

  /**
   * Log custom event in Microsoft Clarity
   * @param eventName Event name
   * @param properties Event properties
   */
  public logClarityEvent(eventName: string, properties?: Record<string, any>): void {
    if (typeof window.clarity !== 'undefined') {
      window.clarity('log', eventName, properties);
    }
  }

  /**
   * Identify user in Microsoft Clarity
   * @param userId User identifier
   * @param properties User properties
   */
  public identifyUser(userId?: string, properties?: Record<string, any>): void {
    if (typeof window.clarity !== 'undefined') {
      window.clarity('identify', userId, properties);
    }
  }
}

export default AnalyticsService;