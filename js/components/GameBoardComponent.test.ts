import { GameBoardComponent } from './GameBoardComponent';
import { GameEngine } from '../core/GameEngine';
import { EventBus } from '../utils/EventBus';

// Mock dependencies
jest.mock('../core/GameEngine');
jest.mock('../utils/EventBus');

describe('GameBoardComponent', () => {
  let gameBoardComponent: GameBoardComponent;
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
          currentIndex: 0,
          wordList: ['apple', 'banana', 'orange'],
          attempts: {},
          wrongAttempts: {},
          currentWordCorrect: false
        }
      }),
      getEventBus: jest.fn().mockReturnValue(mockEventBus),
      checkAnswer: jest.fn().mockReturnValue({
        isCorrect: true,
        attempts: 1,
        wrongAttempts: []
      }),
      nextWord: jest.fn(),
      playCurrentWord: jest.fn(),
      playWordSlower: jest.fn(),
      resetGame: jest.fn()
    } as unknown as jest.Mocked<GameEngine>;
    
    (GameEngine.getInstance as jest.Mock).mockReturnValue(mockGameEngine);
    
    // Create component
    gameBoardComponent = new GameBoardComponent('app');
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });
  
  test('render displays the game board interface', () => {
    gameBoardComponent.render();
    
    const appElement = document.getElementById('app');
    expect(appElement).not.toBeNull();
    expect(appElement?.innerHTML).toContain('answer-input');
    expect(appElement?.innerHTML).toContain('check-button');
    expect(appElement?.innerHTML).toContain('play-word-button');
  });
  
  test('handles check button click with correct answer', () => {
    mockGameEngine.checkAnswer.mockReturnValue({
      isCorrect: true,
      word: 'apple',
      attempts: 1,
      wrongAttempts: []
    });
    
    gameBoardComponent.render();
    
    // Set answer
    const answerInput = document.getElementById('answerInput') as HTMLInputElement;
    expect(answerInput).not.toBeNull();
    answerInput.value = 'apple';
    
    // Click check button
    const checkButton = document.getElementById('checkButton');
    checkButton?.click();
    
    expect(mockGameEngine.checkAnswer).toHaveBeenCalledWith('apple');
    expect(answerInput.value).toBe('apple');
    // In a real implementation, the next word button would be shown
    // and check button would be hidden after a correct answer
  });
  
  test('handles check button click with incorrect answer', () => {
    mockGameEngine.checkAnswer.mockReturnValue({
      isCorrect: false,
      word: 'apple',
      attempts: 1,
      wrongAttempts: ['aple']
    });
    
    gameBoardComponent.render();
    
    // Set answer
    const answerInput = document.getElementById('answerInput') as HTMLInputElement;
    answerInput.value = 'aple';
    
    // Click check button
    const checkButton = document.getElementById('checkButton');
    checkButton?.click();
    
    expect(mockGameEngine.checkAnswer).toHaveBeenCalledWith('aple');
    expect(answerInput.value).toBe(''); // Input should be cleared for retry
  });
  
  test('handles next word button click', () => {
    // First set current word to correct to make next button visible
    mockGameEngine.getState.mockReturnValue({
      settings: { language: 'en' },
      progress: {
        currentIndex: 0,
        wordList: ['apple', 'banana', 'orange'],
        attempts: {},
        wrongAttempts: {},
        currentWordCorrect: true
      }
    });
    
    gameBoardComponent.render();
    
    // Click next word button
    const nextWordButton = document.getElementById('nextWordButton');
    expect(nextWordButton).not.toBeNull();
    nextWordButton?.click();
    
    expect(mockGameEngine.nextWord).toHaveBeenCalled();
  });
  
  test('handles play word button click', () => {
    gameBoardComponent.render();
    
    // Click play word button
    const playWordButton = document.getElementById('playWordButton');
    expect(playWordButton).not.toBeNull();
    playWordButton?.click();
    
    expect(mockGameEngine.playCurrentWord).toHaveBeenCalled();
  });
  
  test('handles play word slower button click', () => {
    gameBoardComponent.render();
    
    // Click play slower button
    const playSlowerButton = document.getElementById('playSlowerButton');
    expect(playSlowerButton).not.toBeNull();
    playSlowerButton?.click();
    
    expect(mockGameEngine.playWordSlower).toHaveBeenCalled();
  });
  
  test('handles word status indicators', () => {
    // Mock state with some completed words
    mockGameEngine.getState.mockReturnValue({
      settings: { language: 'en' },
      progress: {
        currentIndex: 1,
        wordList: ['apple', 'banana', 'orange'],
        attempts: { 0: 1 },  // First word completed in 1 attempt
        wrongAttempts: {},
        currentWordCorrect: false
      }
    });
    
    gameBoardComponent.render();
    
    // Check that word status indicators are rendered correctly
    const wordStatusContainer = document.querySelector('.word-status-indicators');
    expect(wordStatusContainer).not.toBeNull();
    expect(wordStatusContainer?.children.length).toBe(3); // 3 words
    
    // First word should be marked as correct
    const firstWordStatus = wordStatusContainer?.children[0];
    expect(firstWordStatus?.classList.contains('correct')).toBe(true);
    
    // Current word (second) should be marked as current
    const currentWordStatus = wordStatusContainer?.children[1];
    expect(currentWordStatus?.classList.contains('current')).toBe(true);
  });
  
  test('handles return to menu button click', () => {
    gameBoardComponent.render();
    
    // Click return to menu button
    const menuButton = document.getElementById('menuButton');
    expect(menuButton).not.toBeNull();
    menuButton?.click();
    
    expect(mockGameEngine.resetGame).toHaveBeenCalled();
  });
});
