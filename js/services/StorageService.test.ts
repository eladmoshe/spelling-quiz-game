import { StorageService } from './StorageService';
import { GameSettings } from '../models/GameState';
import { PreviousWordSet } from '../models/WordModel';

describe('StorageService', () => {
  let storageService: StorageService;
  
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value.toString();
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      })
    };
  })();
  
  beforeEach(() => {
    // Reset the singleton instance
    Object.defineProperty(StorageService, 'instance', {
      value: undefined,
      writable: true
    });
    
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
    
    // Clear mock localStorage
    localStorageMock.clear();
    
    // Reset mock calls
    jest.clearAllMocks();
    
    // Get a fresh instance
    storageService = StorageService.getInstance();
  });
  
  test('getInstance returns a singleton instance', () => {
    const instance1 = StorageService.getInstance();
    const instance2 = StorageService.getInstance();
    expect(instance1).toBe(instance2);
  });
  
  test('saveGameSettings saves settings to localStorage', () => {
    const settings: GameSettings = {
      language: 'en',
      inputMode: 'random',
      difficulty: 'medium',
      wordCount: 15
    };
    
    storageService.saveGameSettings(settings);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('spellingQuizLanguage', 'en');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('spellingQuizInputMode', 'random');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('spellingQuizDifficulty', 'medium');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('spellingQuizWordCount', '15');
  });
  
  test('saveGameSettings does not save difficulty or wordCount for manual mode', () => {
    const settings: GameSettings = {
      language: 'he',
      inputMode: 'manual',
      difficulty: 'hard',
      wordCount: 10
    };
    
    storageService.saveGameSettings(settings);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('spellingQuizLanguage', 'he');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('spellingQuizInputMode', 'manual');
    expect(localStorageMock.setItem).not.toHaveBeenCalledWith('spellingQuizDifficulty', 'hard');
    expect(localStorageMock.setItem).not.toHaveBeenCalledWith('spellingQuizWordCount', '10');
  });
  
  test('getGameSettings retrieves settings from localStorage', () => {
    // Setup localStorage with test values
    localStorageMock.setItem('spellingQuizLanguage', 'en');
    localStorageMock.setItem('spellingQuizInputMode', 'random');
    localStorageMock.setItem('spellingQuizDifficulty', 'hard');
    localStorageMock.setItem('spellingQuizWordCount', '20');
    
    const settings = storageService.getGameSettings();
    
    expect(settings.language).toBe('en');
    expect(settings.inputMode).toBe('random');
    expect(settings.difficulty).toBe('hard');
    expect(settings.wordCount).toBe(20);
  });
  
  test('getGameSettings handles missing settings', () => {
    // Only set some settings
    localStorageMock.setItem('spellingQuizLanguage', 'he');
    
    const settings = storageService.getGameSettings();
    
    expect(settings.language).toBe('he');
    expect(settings.inputMode).toBeUndefined();
    expect(settings.difficulty).toBeUndefined();
    expect(settings.wordCount).toBeUndefined();
  });
  
  test('saveCurrentWord and getCurrentWord manage the current word state', () => {
    storageService.saveCurrentWord('apple');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('currentWord', 'apple');
    
    // Mock the retrieval
    localStorageMock.getItem.mockReturnValueOnce('apple');
    const word = storageService.getCurrentWord();
    expect(word).toBe('apple');
  });
  
  test('clearCurrentWord removes the current word from storage', () => {
    storageService.clearCurrentWord();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('currentWord');
  });
  
  test('getPreviousWordSets retrieves word sets from localStorage', () => {
    const mockSets: PreviousWordSet[] = [
      { words: ['apple', 'banana'], timestamp: 1000 },
      { words: ['cat', 'dog'], timestamp: 500 }
    ];
    
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockSets));
    
    const sets = storageService.getPreviousWordSets();
    expect(sets).toEqual(mockSets);
  });
  
  test('getPreviousWordSets handles empty localStorage', () => {
    localStorageMock.getItem.mockReturnValueOnce(null);
    
    const sets = storageService.getPreviousWordSets();
    expect(sets).toEqual([]);
  });
  
  test('getPreviousWordSets converts legacy format', () => {
    // Legacy format was array of arrays
    const legacyFormat = [
      ['apple', 'banana'],
      ['cat', 'dog']
    ];
    
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(legacyFormat));
    
    const sets = storageService.getPreviousWordSets();
    
    // Should convert to the new format
    expect(sets.length).toBe(2);
    expect(sets[0].words).toEqual(['apple', 'banana']);
    expect(sets[1].words).toEqual(['cat', 'dog']);
    expect(sets[0].timestamp).toBeDefined();
    expect(sets[1].timestamp).toBeDefined();
  });
  
  test('savePreviousWordSet adds a new set to storage', () => {
    const existingSets: PreviousWordSet[] = [
      { words: ['existing', 'words'], timestamp: 1000 }
    ];
    
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(existingSets));
    
    // Save a new set
    const newWords = ['new', 'words'];
    storageService.savePreviousWordSet(newWords);
    
    // Check what was saved to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
    expect(localStorageMock.setItem.mock.calls[0][0]).toBe('previousWordSets');
    
    // Parse the saved JSON
    const savedSets = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedSets.length).toBe(2);
    expect(savedSets[0].words).toEqual(newWords); // New set should be first
    expect(savedSets[1].words).toEqual(['existing', 'words']);
  });
  
  test('savePreviousWordSet replaces duplicate sets', () => {
    const existingSets: PreviousWordSet[] = [
      { words: ['apple', 'banana'], timestamp: 1000 },
      { words: ['cat', 'dog'], timestamp: 500 }
    ];
    
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(existingSets));
    
    // Save a set with the same words as an existing one
    storageService.savePreviousWordSet(['apple', 'banana']);
    
    // Check what was saved to localStorage
    const savedSets = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedSets.length).toBe(2); // Still 2 sets
    expect(savedSets[0].words).toEqual(['apple', 'banana']); // But with updated timestamp
    expect(savedSets[0].timestamp).not.toBe(1000); // Timestamp should be updated
    expect(savedSets[1].words).toEqual(['cat', 'dog']);
  });
  
  test('savePreviousWordSet limits the number of sets', () => {
    // Create more sets than the MAX_STORED_SETS limit
    const manySets: PreviousWordSet[] = Array.from({ length: 10 }, (_, i) => ({
      words: [`set-${i}`],
      timestamp: i
    }));
    
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(manySets));
    
    // Save another set
    storageService.savePreviousWordSet(['new', 'set']);
    
    // Check what was saved to localStorage
    const savedSets = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedSets.length).toBe(5); // Should be limited to 5 (MAX_STORED_SETS)
    expect(savedSets[0].words).toEqual(['new', 'set']); // New set should be first
  });
});