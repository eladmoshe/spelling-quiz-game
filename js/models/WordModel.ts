export interface WordOptions {
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
}

export interface WordComparisonResult {
  isCorrect: boolean;
  firstWrongLetter: number;
}

export interface WordHint {
  correct: boolean;
  message: string;
  progress: string;
  wrongLetterPosition: number;
}

export interface PreviousWordSet {
  words: string[];
  timestamp: number;
}