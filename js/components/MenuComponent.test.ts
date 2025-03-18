import { MenuComponent } from './MenuComponent';
import { GameEngine } from '../core/GameEngine';
import { EventBus } from '../utils/EventBus';

// Mock dependencies
jest.mock('../core/GameEngine');
jest.mock('../utils/EventBus');

describe('MenuComponent', () => {
  let menuComponent: MenuComponent;
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
          language: 'en',
          inputMode: 'manual',
          difficulty: 'medium',
          wordCount: 10
        },
        screen: 'menu'
      }),
      getEventBus: jest.fn().mockReturnValue(mockEventBus),
      toggleLanguage: jest.fn(),
      setInputMode: jest.fn(),
      startGame: jest.fn(),
      startRandomGame: jest.fn()
    } as unknown as jest.Mocked<GameEngine>;
    
    (GameEngine.getInstance as jest.Mock).mockReturnValue(mockGameEngine);
    
    // Create component
    menuComponent = new MenuComponent('app');
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });
  
  test('render displays the menu interface', () => {
    menuComponent.render();
    
    const appElement = document.getElementById('app');
    expect(appElement).not.toBeNull();
    expect(appElement?.innerHTML).toContain('language-toggle');
    expect(appElement?.innerHTML).toContain('start-button');
  });
  
  test('handles language toggle click', () => {
    menuComponent.render();
    
    const languageToggle = document.getElementById('languageToggle');
    expect(languageToggle).not.toBeNull();
    
    languageToggle?.click();
    expect(mockGameEngine.toggleLanguage).toHaveBeenCalled();
  });
  
  test('handles input mode selection', () => {
    menuComponent.render();
    
    const manualModeButton = document.getElementById('manualMode');
    const randomModeButton = document.getElementById('randomMode');
    
    manualModeButton?.click();
    expect(mockGameEngine.setInputMode).toHaveBeenCalledWith('manual');
    
    randomModeButton?.click();
    expect(mockGameEngine.setInputMode).toHaveBeenCalledWith('random');
  });
  
  test('handles start button with valid input in manual mode', () => {
    mockGameEngine.getState.mockReturnValue({
      settings: {
        language: 'en',
        inputMode: 'manual'
      },
      screen: 'menu'
    });
    
    menuComponent.render();
    
    // Set word input
    const wordInput = document.getElementById('wordInput') as HTMLTextAreaElement;
    expect(wordInput).not.toBeNull();
    wordInput.value = 'apple,banana,orange';
    
    // Click start button
    const startButton = document.getElementById('startPractice');
    startButton?.click();
    
    expect(mockGameEngine.startGame).toHaveBeenCalledWith(
      expect.arrayContaining(['apple', 'banana', 'orange'])
    );
  });
  
  test('handles start button in random mode', () => {
    mockGameEngine.getState.mockReturnValue({
      settings: {
        language: 'en',
        inputMode: 'random'
      },
      screen: 'menu'
    });
    
    menuComponent.render();
    
    // Set difficulty and word count
    const difficultySelect = document.getElementById('difficulty') as HTMLSelectElement;
    difficultySelect.value = 'hard';
    
    const wordCountInput = document.getElementById('wordCount') as HTMLInputElement;
    wordCountInput.value = '15';
    
    // Click start button
    const startButton = document.getElementById('startPractice');
    startButton?.click();
    
    expect(mockGameEngine.startRandomGame).toHaveBeenCalledWith({
      difficulty: 'hard',
      count: 15
    });
  });
  
  test('shows error for invalid input in manual mode', () => {
    mockGameEngine.getState.mockReturnValue({
      settings: {
        language: 'en',
        inputMode: 'manual'
      },
      screen: 'menu'
    });
    
    menuComponent.render();
    
    // Set invalid word input (empty)
    const wordInput = document.getElementById('wordInput') as HTMLTextAreaElement;
    wordInput.value = '';
    
    // Click start button
    const startButton = document.getElementById('startPractice');
    startButton?.click();
    
    // Check error is displayed
    expect(wordInput.classList.contains('error')).toBe(true);
    expect(mockGameEngine.startGame).not.toHaveBeenCalled();
  });
});
