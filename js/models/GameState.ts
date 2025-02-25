export type Language = 'en' | 'he';
export type InputMode = 'manual' | 'random';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameScreen = 'menu' | 'practice' | 'summary';

export interface WordAttempt {
  word: string;
  attempts: number;
  wrongAttempts: string[];
  isCorrect: boolean;
}

export interface GameSettings {
  language: Language;
  inputMode: InputMode;
  difficulty: Difficulty;
  wordCount: number;
}

export interface GameProgress {
  currentIndex: number;
  wordList: string[];
  attempts: Record<number, number>;
  wrongAttempts: Record<number, string[]>;
  currentWordCorrect: boolean;
}

export interface GameState {
  settings: GameSettings;
  screen: GameScreen;
  progress: GameProgress;
  lastPlayTime: number;
}

export interface GameStats {
  totalWords: number;
  perfectWords: number;
  accuracy: number;
  oneAttemptWords: number;
  twoAttemptWords: number;
  threeAttemptWords: number;
  wrongAttempts: number;
}

export interface GameStartParams {
  wordCount: number;
  difficulty: string;
  inputMode: InputMode;
  language: Language;
}