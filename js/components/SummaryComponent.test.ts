import { SummaryComponent } from './SummaryComponent';
import { GameEngine } from '../core/GameEngine';
import { EventBus } from '../utils/EventBus';

// Mock dependencies
jest.mock('../core/GameEngine');
jest.mock('../utils/EventBus');

describe('SummaryComponent', () => {
  let summaryComponent: SummaryComponent;
  let mockGameEngine: jest.Mocked<GameEngine>;
  let mockEventBus: jest.Mocked<EventBus>;
  
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = '<div id="app"></div>';
    
    // Setup mock implementations
    mockEventBus = {
      on: jest.fn().mockReturnValue(() => {}),
      emit: jest.fn(),
      once: jest.fn(),
      off: jest.fn(),
      clear: jest.fn(),
      listenerCount: jest.fn()
    } as unknown as jest.Mocked<EventBus>;
    
    mockGameEngine = {
      getInstance: jest.fn().mockReturnThis(),
      getState: jest.fn().mockReturnValue({
        settings: {
          language: 'en'
        },
        progress: {
          wordList: ['apple', 'banana', 'orange'],
          attempts: { 0: 1, 1: 2, 2: 1 }
        }
      }),
      getEventBus: jest.fn().mockReturnValue(mockEventBus),
      calculateGameStats: jest.fn().mockReturnValue({
        totalWords: 3,
        perfectWords: 2,
        accuracy: 67,
        oneAttemptWords: 2,
        twoAttemptWords: 1,
        threeAttemptWords: 0,
        wrongAttempts: 1
      }),
      resetGame: jest.fn()
    } as unknown as jest.Mocked<GameEngine>;
    
    (GameEngine.getInstance as jest.Mock).mockReturnValue(mockGameEngine);
    
    // Create component
    summaryComponent = new SummaryComponent('app');
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });
  
  test('render displays the summary interface', () => {
    summaryComponent.render();
    
    const appElement = document.getElementById('app');
    expect(appElement).not.toBeNull();
    expect(appElement?.innerHTML).toContain('summary-card');
    expect(appElement?.innerHTML).toContain('play-again-button');
  });
  
  test('displays correct game statistics', () => {
    summaryComponent.render();
    
    const summaryContent = document.querySelector('.summary-card');
    expect(summaryContent).not.toBeNull();
    
    // Check stats values
    expect(summaryContent?.innerHTML).toContain('3'); // Total words
    expect(summaryContent?.innerHTML).toContain('67%'); // Accuracy
    expect(summaryContent?.innerHTML).toContain('2'); // Perfect words
  });
  
  test('handles play again button click', () => {
    summaryComponent.render();
    
    // Click play again button
    const playAgainButton = document.getElementById('playAgainButton');
    expect(playAgainButton).not.toBeNull();
    playAgainButton?.click();
    
    expect(mockGameEngine.resetGame).toHaveBeenCalled();
  });
  
  test('displays the correct performance message based on accuracy', () => {
    // Test with high accuracy
    mockGameEngine.calculateGameStats.mockReturnValue({
      totalWords: 5,
      perfectWords: 5,
      accuracy: 100,
      oneAttemptWords: 5,
      twoAttemptWords: 0,
      threeAttemptWords: 0,
      wrongAttempts: 0
    });
    
    summaryComponent.render();
    
    let summaryContent = document.querySelector('.summary-card');
    expect(summaryContent?.innerHTML).toContain('Perfect'); // Should show perfect performance message
    
    // Test with medium accuracy
    document.body.innerHTML = '<div id="app"></div>';
    mockGameEngine.calculateGameStats.mockReturnValue({
      totalWords: 5,
      perfectWords: 3,
      accuracy: 60,
      oneAttemptWords: 3,
      twoAttemptWords: 2,
      threeAttemptWords: 0,
      wrongAttempts: 2
    });
    
    summaryComponent.render();
    
    summaryContent = document.querySelector('.summary-card');
    expect(summaryContent?.innerHTML).toContain('Good job'); // Should show good job message
    
    // Test with low accuracy
    document.body.innerHTML = '<div id="app"></div>';
    mockGameEngine.calculateGameStats.mockReturnValue({
      totalWords: 5,
      perfectWords: 1,
      accuracy: 20,
      oneAttemptWords: 1,
      twoAttemptWords: 1,
      threeAttemptWords: 3,
      wrongAttempts: 7
    });
    
    summaryComponent.render();
    
    summaryContent = document.querySelector('.summary-card');
    expect(summaryContent?.innerHTML).toContain('Keep practicing'); // Should show encouragement message
  });
  
  test('displays attempt distribution correctly', () => {
    mockGameEngine.calculateGameStats.mockReturnValue({
      totalWords: 10,
      perfectWords: 5,
      accuracy: 50,
      oneAttemptWords: 5,
      twoAttemptWords: 3,
      threeAttemptWords: 1,
      wrongAttempts: 5
    });
    
    summaryComponent.render();
    
    const attemptDistribution = document.querySelector('.attempt-distribution');
    expect(attemptDistribution).not.toBeNull();
    
    // Check attempt counts
    expect(attemptDistribution?.innerHTML).toContain('5'); // One-attempt words
    expect(attemptDistribution?.innerHTML).toContain('3'); // Two-attempt words
    expect(attemptDistribution?.innerHTML).toContain('1'); // Three-attempt words
  });
});
