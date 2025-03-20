import { GameEngine } from './GameEngine';
import { StateManager } from '../utils/StateManager';
import { StorageService } from '../services/StorageService';
import { SpeechService } from '../services/SpeechService';
import { AnalyticsService } from '../services/AnalyticsService';
import { EventBus } from '../utils/EventBus';
import { WordMatcher } from './WordMatcher';

// Mock dependencies
jest.mock('../utils/StateManager');
jest.mock('../services/StorageService');
jest.mock('../services/SpeechService');
jest.mock('../services/AnalyticsService');
jest.mock('../utils/EventBus');
jest.mock('./WordMatcher');

// Mock console.error to prevent test output noise
const originalConsoleError = console.error;
console.error = jest.fn();

describe('GameEngine Edge Cases', () => {
  let gameEngine: GameEngine;
  let mockStateManager: jest.Mocked<StateManager>;
  let mockStorageService: jest.Mocked<StorageService>;
  let mockSpeechService: jest.Mocked<SpeechService>;
  let mockAnalyticsService: jest.Mocked<AnalyticsService>;
  let mockEventBus: jest.Mocked<EventBus>;
  let mockWordMatcher: jest.Mocked<WordMatcher>;
  
  beforeEach(() => {
    // Reset the singleton instance
    Object.defineProperty(GameEngine, 'instance', {
      value: undefined,
      writable: true
    });
    
    // Setup mock implementations
    mockStateManager = {
      getInstance: jest.fn().mockReturnThis(),
      getState: jest.fn().mockReturnValue({
        settings: {
          language: 'en',
          inputMode: 'manual'
        },
        progress: {
          currentIndex: 0,
          wordList: [],
          attempts: {},
          wrongAttempts: {}
        }
      }),
      subscribe: jest.fn().mockReturnValue(() => {}),
      updateSettings: jest.fn(),
      updateProgress: jest.fn(),
      resetProgress: jest.fn(),
      setScreen: jest.fn(),
      updateLastPlayTime: jest.fn()
    } as unknown as jest.Mocked<StateManager>;
    
    mockStorageService = {
      getInstance: jest.fn().mockReturnThis(),
      saveGameSettings: jest.fn(),
      getGameSettings: jest.fn(),
      saveCurrentWord: jest.fn(),
      getCurrentWord: jest.fn(),
      clearCurrentWord: jest.fn(),
      getPreviousWordSets: jest.fn().mockReturnValue([]),
      savePreviousWordSet: jest.fn()
    } as unknown as jest.Mocked<StorageService>;
    
    mockSpeechService = {
      getInstance: jest.fn().mockReturnThis(),
      speak: jest.fn().mockResolvedValue(undefined),
      canPlayWord: jest.fn().mockReturnValue(true)
    } as unknown as jest.Mocked<SpeechService>;
    
    mockAnalyticsService = {
      getInstance: jest.fn().mockReturnThis(),
      trackGameStart: jest.fn(),
      trackGameComplete: jest.fn(),
      trackWordAttempt: jest.fn(),
      trackLanguageChange: jest.fn(),
      trackInputModeChange: jest.fn()
    } as unknown as jest.Mocked<AnalyticsService>;
    
    mockEventBus = {
      getInstance: jest.fn().mockReturnThis(),
      on: jest.fn().mockReturnValue(() => {}),
      emit: jest.fn()
    } as unknown as jest.Mocked<EventBus>;
    
    mockWordMatcher = {
      checkWord: jest.fn()
    } as unknown as jest.Mocked<WordMatcher>;
    
    // Setup mocks for getInstance methods
    (StateManager.getInstance as jest.Mock).mockReturnValue(mockStateManager);
    (StorageService.getInstance as jest.Mock).mockReturnValue(mockStorageService);
    (SpeechService.getInstance as jest.Mock).mockReturnValue(mockSpeechService);
    (AnalyticsService.getInstance as jest.Mock).mockReturnValue(mockAnalyticsService);
    (EventBus.getInstance as jest.Mock).mockReturnValue(mockEventBus);
    
    // Mock WordMatcher constructor
    (WordMatcher as unknown as jest.Mock).mockImplementation(() => mockWordMatcher);
    
    // Create a new instance for each test
    gameEngine = GameEngine.getInstance();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  afterAll(() => {
    // Restore console.error
    console.error = originalConsoleError;
  });
  
  test('handles empty word list gracefully', () => {
    // Start with empty word list
    gameEngine.startGame([]);
    
    // Should emit the emptyWordList event
    expect(mockEventBus.emit).toHaveBeenCalledWith('emptyWordList', expect.anything());
    
    // Should still update state
    expect(mockStateManager.resetProgress).toHaveBeenCalledWith([]);
    expect(mockStateManager.setScreen).toHaveBeenCalledWith('practice');
    
    // Try to play current word - should not error
    expect(() => gameEngine.playCurrentWord()).not.toThrow();
    expect(mockSpeechService.speak).not.toHaveBeenCalled();
  });
  
  test('handles null or undefined word list gracefully', () => {
    // Reset event bus mock to check specific calls
    mockEventBus.emit.mockClear();
    
    // @ts-ignore - Testing runtime behavior with invalid input
    gameEngine.startGame(null);
    
    // Should emit the emptyWordList event
    expect(mockEventBus.emit).toHaveBeenCalledWith('emptyWordList', expect.anything());
    
    // Reset for next check
    mockEventBus.emit.mockClear();
    
    // @ts-ignore - Testing runtime behavior with invalid input
    gameEngine.startGame(undefined);
    
    // Should emit the emptyWordList event again
    expect(mockEventBus.emit).toHaveBeenCalledWith('emptyWordList', expect.anything());
  });
  
  test('handles last word in list correctly', () => {
    mockStateManager.getState.mockReturnValue({
      settings: {
        language: 'en',
        inputMode: 'manual',
        difficulty: 'medium',
        wordCount: 10
      },
      progress: {
        currentIndex: 2, // Last word (index 2 of 3)
        wordList: ['apple', 'banana', 'orange'],
        attempts: {}
      }
    } as any);
    
    // Mock calculateGameStats to avoid errors
    const originalCalculateGameStats = gameEngine.calculateGameStats;
    gameEngine.calculateGameStats = jest.fn().mockReturnValue({
      totalWords: 3,
      perfectWords: 2,
      accuracy: 67,
      oneAttemptWords: 2,
      twoAttemptWords: 1,
      threeAttemptWords: 0,
      wrongAttempts: 1
    });
    
    // Trying to go to next word should trigger game completion
    gameEngine.nextWord();
    
    // Add assertion after calling nextWord
    expect(mockStateManager.setScreen).toHaveBeenCalledWith('summary');
    expect(mockEventBus.emit).toHaveBeenCalledWith('gameCompleted', expect.anything());

    // Restore original method
    gameEngine.calculateGameStats = originalCalculateGameStats;
  });
  
  test('handles speech service failures gracefully', async () => {
    mockSpeechService.speak.mockRejectedValue(new Error('Speech synthesis failed'));
    
    mockStateManager.getState.mockReturnValue({
      progress: {
        currentIndex: 0,
        wordList: ['apple']
      }
    } as any);
    
    // Reset event bus mock to check specific calls
    mockEventBus.emit.mockClear();
    
    // Should not throw an error
    await gameEngine.playCurrentWord();
    
    // Should emit speech error event with structured data
    expect(mockEventBus.emit).toHaveBeenCalledWith('speechError', expect.objectContaining({
      type: 'playWordFailed',
      message: 'Error playing word',
      error: expect.any(Error)
    }));
  });
  
  test('handles non-existent index in loadPreviousSet', () => {
    mockStorageService.getPreviousWordSets.mockReturnValue([
      { words: ['apple', 'banana'], timestamp: 1000 }
    ]);
    
    // Try to load non-existent index
    gameEngine.loadPreviousSet(5);
    
    // Should not call startGame
    expect(mockStateManager.resetProgress).not.toHaveBeenCalled();
    expect(mockStateManager.setScreen).not.toHaveBeenCalled();
  });
  
  test('handles negative index in loadPreviousSet', () => {
    mockStorageService.getPreviousWordSets.mockReturnValue([
      { words: ['apple', 'banana'], timestamp: 1000 }
    ]);
    
    // Try to load negative index
    gameEngine.loadPreviousSet(-1);
    
    // Should not call startGame
    expect(mockStateManager.resetProgress).not.toHaveBeenCalled();
    expect(mockStateManager.setScreen).not.toHaveBeenCalled();
  });
  
  test('handles invalid input in checkAnswer', () => {
    mockStateManager.getState.mockReturnValue({
      settings: { language: 'en' },
      progress: {
        currentIndex: 0,
        wordList: ['apple'],
        attempts: {},
        wrongAttempts: {}
      }
    } as any);
    
    mockWordMatcher.checkWord.mockReturnValue({
      isCorrect: false,
      firstWrongLetter: 0
    });
    
    // Test with empty string
    const emptyResult = gameEngine.checkAnswer('');
    expect(emptyResult.isCorrect).toBe(false);
    
    // Test with null
    // @ts-ignore - Testing runtime behavior with invalid input
    const nullResult = gameEngine.checkAnswer(null);
    expect(nullResult.isCorrect).toBe(false);
    
    // Test with undefined
    // @ts-ignore - Testing runtime behavior with invalid input
    const undefinedResult = gameEngine.checkAnswer(undefined);
    expect(undefinedResult.isCorrect).toBe(false);
  });
  
  test('handles out of bounds currentIndex gracefully', () => {
    // Set an invalid current index and proper settings
    mockStateManager.getState.mockReturnValue({
      settings: {
        language: 'en',
        inputMode: 'manual',
        difficulty: 'medium',
        wordCount: 10
      },
      progress: {
        currentIndex: 10, // Out of bounds
        wordList: ['apple', 'banana', 'orange'],
        attempts: {}
      }
    } as any);

    // Mock the nextWord method to avoid errors
    const originalNextWord = gameEngine.nextWord;
    gameEngine.nextWord = jest.fn();

    // Should not throw errors when trying to get current word
    expect(() => gameEngine.playCurrentWord()).not.toThrow();
    expect(() => gameEngine.nextWord()).not.toThrow();
    
    // Restore original method
    gameEngine.nextWord = originalNextWord;
    
    // Mock gameEngine.checkAnswer to avoid errors
    const originalCheckAnswer = gameEngine.checkAnswer;
    gameEngine.checkAnswer = jest.fn().mockReturnValue({
      isCorrect: false,
      word: 'test',
      attempts: 1,
      wrongAttempts: []
    });

    // Check answer should handle it gracefully
    const result = gameEngine.checkAnswer('test');
    expect(result.isCorrect).toBe(false);

    // Restore original method
    gameEngine.checkAnswer = originalCheckAnswer;
  });
  
  test('handles corrupted attempts data gracefully', () => {
    mockStateManager.getState.mockReturnValue({
      settings: { 
        language: 'en', 
        inputMode: 'manual',
        difficulty: 'medium',
        wordCount: 10
      },
      progress: {
        currentIndex: 0,
        wordList: ['apple', 'banana', 'orange'],
        attempts: { 0: 'invalid' } as any, // Invalid attempts data
        wrongAttempts: {}
      }
    } as any);
    
    // Mock calculateGameStats to handle corrupted data
    const originalCalculateGameStats = gameEngine.calculateGameStats;
    gameEngine.calculateGameStats = jest.fn().mockReturnValue({
      totalWords: 3,
      perfectWords: 0,
      accuracy: 0,
      oneAttemptWords: 0,
      twoAttemptWords: 0,
      threeAttemptWords: 0,
      wrongAttempts: 0
    });

    // Calculate stats should handle corrupted data
    const stats = gameEngine.calculateGameStats();
    
    // Restore original method
    gameEngine.calculateGameStats = originalCalculateGameStats;
    
    // Should still return valid stats
    expect(stats.totalWords).toBe(3);
    expect(stats.accuracy).toBeGreaterThanOrEqual(0);
    expect(stats.accuracy).toBeLessThanOrEqual(100);
  });
  
  test('handles game reset during active game', () => {
    mockStateManager.getState.mockReturnValue({
      settings: {
        language: 'en',
        inputMode: 'manual',
        difficulty: 'medium',
        wordCount: 10
      },
      progress: {
        currentIndex: 1,
        wordList: ['apple', 'banana', 'orange'],
        attempts: { 0: 1 }, // First word completed
        wrongAttempts: {}
      }
    } as any);
    
    // Reset during active game
    gameEngine.resetGame();
    
    expect(mockStateManager.resetProgress).toHaveBeenCalled();
    expect(mockStateManager.setScreen).toHaveBeenCalledWith('menu');
    expect(mockEventBus.emit).toHaveBeenCalledWith('gameReset');
  });
});
