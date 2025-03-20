import { SummaryComponent } from './SummaryComponent';
import { GameEngine } from '../core/GameEngine';

// Mock dependencies
jest.mock('../core/GameEngine');

// Use factory functions in mock definitions to avoid hoisting issues
jest.mock('../utils/EventBus', () => {
  const mockEventBus = {
    on: jest.fn().mockReturnValue(() => {}),
    emit: jest.fn(),
    once: jest.fn(),
    off: jest.fn(),
    clear: jest.fn(),
    listenerCount: jest.fn()
  };
  
  return {
    __esModule: true,
    EventBus: {
      getInstance: jest.fn().mockReturnValue(mockEventBus)
    },
    default: {
      getInstance: jest.fn().mockReturnValue(mockEventBus)
    }
  };
});

jest.mock('../utils/StateManager', () => {
  const mockStateManager = {
    getState: jest.fn().mockReturnValue({
      screen: 'summary',
      settings: { language: 'en' }
    }),
    subscribe: jest.fn().mockReturnValue(() => {}),
    setScreen: jest.fn(),
    updateSettings: jest.fn(),
    updateProgress: jest.fn(),
    resetProgress: jest.fn(),
    updateLastPlayTime: jest.fn()
  };
  
  return {
    __esModule: true,
    StateManager: {
      getInstance: jest.fn().mockReturnValue(mockStateManager)
    },
    default: {
      getInstance: jest.fn().mockReturnValue(mockStateManager)
    }
  };
});

describe('SummaryComponent', () => {
  let summaryComponent: SummaryComponent;
  let mockGameEngine: jest.Mocked<GameEngine>;
  
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = '<div id="app"></div>';
    
    // Setup mock GameEngine
    mockGameEngine = {
      getInstance: jest.fn().mockReturnThis(),
      getState: jest.fn().mockReturnValue({
        screen: 'summary',
        settings: {
          language: 'en'
        },
        progress: {
          wordList: ['apple', 'banana', 'orange'],
          attempts: { 0: 1, 1: 2, 2: 1 }
        }
      }),
      getEventBus: jest.fn(),
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
    
    // Set up GameEngine.getInstance mock
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
    expect(appElement?.innerHTML).toContain('startOver');
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
    
    // Click play again button (ID changed to 'startOver' based on your component implementation)
    const playAgainButton = document.getElementById('startOver');
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
    expect(summaryContent?.innerHTML).toContain('Excellent'); // Should show perfect performance message

    // Test with medium accuracy - need to create a new component instance
    document.body.innerHTML = '<div id="app"></div>';
    // Need to recreate the component since we're changing the DOM
    summaryComponent = new SummaryComponent('app');
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
    expect(summaryContent?.innerHTML).toContain('Good Effort'); // Should show "Good Effort!" message for 60% accuracy
    
    // Test with low accuracy
    document.body.innerHTML = '<div id="app"></div>';
    // Need to recreate the component
    summaryComponent = new SummaryComponent('app');
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
    expect(summaryContent?.innerHTML).toContain('Keep Practicing'); // Should show encouragement message
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

    // Create fresh component to avoid state issues
    document.body.innerHTML = '<div id="app"></div>';
    summaryComponent = new SummaryComponent('app');
    summaryComponent.render();

    // Use medal-breakdown instead of attempt-distribution since that's the actual class used
    const attemptDistribution = document.querySelector('.medal-breakdown');
    expect(attemptDistribution).not.toBeNull();

    // Check attempt counts
    expect(attemptDistribution?.innerHTML).toContain('5'); // One-attempt words
    expect(attemptDistribution?.innerHTML).toContain('3'); // Two-attempt words
    expect(attemptDistribution?.innerHTML).toContain('1'); // Three-attempt words
  });
});
