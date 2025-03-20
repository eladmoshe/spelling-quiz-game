import { AnalyticsService } from './AnalyticsService';

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;
  
  // Mock window.gtag
  const mockGtag = jest.fn();
  
  // Mock window.clarity
  const mockClarity = jest.fn();
  
  beforeEach(() => {
    // Reset the singleton instance
    Object.defineProperty(AnalyticsService, 'instance', {
      value: undefined,
      writable: true
    });
    
    // Mock global functions
    global.window = Object.create(window);
    Object.defineProperty(window, 'gtag', {
      value: mockGtag,
      writable: true
    });
    Object.defineProperty(window, 'clarity', {
      value: mockClarity,
      writable: true
    });
    
    // Create a new instance for each test
    analyticsService = AnalyticsService.getInstance();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('getInstance returns a singleton instance', () => {
    const instance1 = AnalyticsService.getInstance();
    const instance2 = AnalyticsService.getInstance();
    expect(instance1).toBe(instance2);
  });
  
  test('trackGameStart sends the correct event', () => {
    const gameDetails = {
      wordCount: 10,
      difficulty: 'medium' as 'easy' | 'medium' | 'hard',
      inputMode: 'random' as 'manual' | 'random',
      language: 'en' as 'en' | 'he'
    };
    
    analyticsService.trackGameStart(gameDetails);
    
    expect(mockGtag).toHaveBeenCalledWith('event', 'game_start', expect.objectContaining({
      word_count: 10,
      difficulty: 'medium',
      input_mode: 'random',
      language: 'en'
    }));
  });
  
  test('trackGameComplete sends the correct event', () => {
    const gameStats = {
      totalWords: 10,
      perfectWords: 7,
      accuracy: 70,
      oneAttemptWords: 7,
      twoAttemptWords: 2,
      threeAttemptWords: 1,
      wrongAttempts: 3,
      inputMode: 'manual' as 'manual' | 'random',
      difficulty: 'easy' as 'easy' | 'medium' | 'hard',
      language: 'en' as 'en' | 'he'
    };
    
    analyticsService.trackGameComplete(gameStats);
    
    expect(mockGtag).toHaveBeenCalledWith('event', 'game_complete', expect.objectContaining({
      total_words: 10,
      perfect_words: 7,
      accuracy: 70
    }));
  });
  
  test('trackWordAttempt sends the correct event', () => {
    const attemptDetails = {
      word: 'apple',
      attempt: 'aple',
      isCorrect: false,
      attemptNumber: 1,
      language: 'en'
    };
    
    analyticsService.trackWordAttempt(attemptDetails);
    
    expect(mockGtag).toHaveBeenCalledWith('event', 'word_attempt', expect.objectContaining({
      word: 'apple',
      is_correct: false,
      attempt_number: 1
    }));
  });
  
  test('trackLanguageChange sends the correct event', () => {
    analyticsService.trackLanguageChange('he');
    
    expect(mockGtag).toHaveBeenCalledWith('event', 'language_change', expect.objectContaining({
      language: 'he'
    }));
  });
  
  test('trackInputModeChange sends the correct event', () => {
    analyticsService.trackInputModeChange('random');
    
    expect(mockGtag).toHaveBeenCalledWith('event', 'input_mode_change', expect.objectContaining({
      input_mode: 'random'
    }));
  });
  
  test('trackPreviousSetLoad sends the correct event', () => {
    analyticsService.trackPreviousSetLoad(2);
    
    expect(mockGtag).toHaveBeenCalledWith('event', 'previous_set_load', expect.objectContaining({
      set_index: 2
    }));
  });
  
  test('handles missing analytics libraries gracefully', () => {
    // Save original window.gtag and window.clarity
    const originalGtag = window.gtag;
    const originalClarity = window.clarity;
    
    // Set to undefined for test
    // @ts-ignore
    window.gtag = undefined;
    // @ts-ignore
    window.clarity = undefined;
    
    // Should not throw errors
    expect(() => {
      analyticsService.trackGameStart({ wordCount: 5, difficulty: 'easy', inputMode: 'manual', language: 'en' });
      analyticsService.trackLanguageChange('en');
      analyticsService.logClarityEvent('test_event');
    }).not.toThrow();
    
    // Restore original values
    window.gtag = originalGtag;
    window.clarity = originalClarity;
  });
  
  test('configureClarityConsent sets up clarity correctly', () => {
    analyticsService.configureClarityConsent(true);
    
    if (typeof window.clarity === 'function') {
      expect(mockClarity).toHaveBeenCalledWith('consent', 'granted');
    }
  });
  
  test('configureClarityConsent handles opt-out correctly', () => {
    analyticsService.configureClarityConsent(false);
    
    if (typeof window.clarity === 'function') {
      expect(mockClarity).toHaveBeenCalledWith('consent', 'denied');
    }
  });
  
  test('logClarityEvent sends custom events to Clarity', () => {
    analyticsService.logClarityEvent('custom_event', { key: 'value' });
    
    if (typeof window.clarity === 'function') {
      expect(mockClarity).toHaveBeenCalledWith('log', 'custom_event', { key: 'value' });
    }
  });
  
  test('identifyUser sends identity to Clarity', () => {
    analyticsService.identifyUser('test-user');
    
    if (typeof window.clarity === 'function') {
      expect(mockClarity).toHaveBeenCalledWith('identify', 'test-user', undefined);
    }
  });
});
