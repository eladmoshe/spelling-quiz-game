import { PreviousWordSet } from '../models/WordModel';
import { GameSettings } from '../models/GameState';

export class StorageService {
  private static instance: StorageService;
  private readonly PREVIOUS_SETS_KEY = 'previousWordSets';
  private readonly MAX_STORED_SETS = 5;
  private readonly CURRENT_WORD_KEY = 'currentWord';
  private readonly SETTINGS_PREFIX = 'spellingQuiz';

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Settings
  public saveGameSettings(settings: GameSettings): void {
    const { language, inputMode, difficulty, wordCount } = settings;
    
    // Save language
    localStorage.setItem(`${this.SETTINGS_PREFIX}Language`, language);
    
    // Save input mode
    localStorage.setItem(`${this.SETTINGS_PREFIX}InputMode`, inputMode);
    
    // Save difficulty and word count if in random mode
    if (inputMode === 'random') {
      localStorage.setItem(`${this.SETTINGS_PREFIX}Difficulty`, difficulty);
      localStorage.setItem(`${this.SETTINGS_PREFIX}WordCount`, wordCount.toString());
    }
  }

  public getGameSettings(): Partial<GameSettings> {
    const settings: Partial<GameSettings> = {};
    
    const language = localStorage.getItem(`${this.SETTINGS_PREFIX}Language`);
    if (language === 'en' || language === 'he') {
      settings.language = language;
    }
    
    const inputMode = localStorage.getItem(`${this.SETTINGS_PREFIX}InputMode`) as 'manual' | 'random';
    if (inputMode === 'manual' || inputMode === 'random') {
      settings.inputMode = inputMode;
    }
    
    const difficulty = localStorage.getItem(`${this.SETTINGS_PREFIX}Difficulty`);
    if (difficulty) {
      settings.difficulty = difficulty as 'easy' | 'medium' | 'hard';
    }
    
    const wordCount = localStorage.getItem(`${this.SETTINGS_PREFIX}WordCount`);
    if (wordCount) {
      settings.wordCount = parseInt(wordCount, 10);
    }
    
    return settings;
  }

  // Current word
  public saveCurrentWord(word: string): void {
    localStorage.setItem(this.CURRENT_WORD_KEY, word);
  }

  public getCurrentWord(): string | null {
    return localStorage.getItem(this.CURRENT_WORD_KEY);
  }

  public clearCurrentWord(): void {
    localStorage.removeItem(this.CURRENT_WORD_KEY);
  }

  // Previous word sets
  public getPreviousWordSets(): PreviousWordSet[] {
    const savedSets = localStorage.getItem(this.PREVIOUS_SETS_KEY);
    if (!savedSets) return [];
    
    try {
      const parsedSets = JSON.parse(savedSets);
      // Convert legacy format if needed
      if (Array.isArray(parsedSets) && parsedSets.length > 0) {
        // Check if items are already in the new format
        if (typeof parsedSets[0] === 'object' && 'words' in parsedSets[0]) {
          return parsedSets;
        }
        
        // Convert from legacy format (array of string arrays)
        return parsedSets.map((words: string[]) => ({
          words,
          timestamp: Date.now() // Use current time since legacy format didn't have timestamps
        }));
      }
      return [];
    } catch (error) {
      console.error('Error parsing previous word sets:', error);
      return [];
    }
  }

  public savePreviousWordSet(words: string[]): void {
    const previousSets = this.getPreviousWordSets();
    
    // Check if set already exists
    const existingSetIndex = previousSets.findIndex(
      set => this.areWordSetsEqual(set.words, words)
    );
    
    if (existingSetIndex !== -1) {
      // Remove the existing set so we can add it to the front
      previousSets.splice(existingSetIndex, 1);
    }
    
    // Add the new set to the front
    const newSet: PreviousWordSet = {
      words,
      timestamp: Date.now()
    };
    
    // Add to front and limit to MAX_STORED_SETS
    const newSets = [newSet, ...previousSets].slice(0, this.MAX_STORED_SETS);
    
    localStorage.setItem(this.PREVIOUS_SETS_KEY, JSON.stringify(newSets));
  }

  private areWordSetsEqual(set1: string[], set2: string[]): boolean {
    if (set1.length !== set2.length) return false;
    return set1.join(',') === set2.join(',');
  }
}

export default StorageService;