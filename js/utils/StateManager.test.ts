import { StateManager } from './StateManager';
import { GameScreen } from '../models/GameState';

describe('StateManager', () => {
  let stateManager: StateManager;

  beforeEach(() => {
    // Reset the singleton between tests
    jest.resetModules();
    // Use Object.defineProperty to reset the StateManager instance
    Object.defineProperty(StateManager, 'instance', {
      value: undefined,
      writable: true
    });
    stateManager = StateManager.getInstance();
  });

  test('getInstance returns a singleton instance', () => {
    const instance1 = StateManager.getInstance();
    const instance2 = StateManager.getInstance();
    expect(instance1).toBe(instance2);
  });

  test('getState returns the current state', () => {
    const state = stateManager.getState();
    expect(state).toHaveProperty('settings');
    expect(state).toHaveProperty('screen');
    expect(state).toHaveProperty('progress');
  });

  test('dispatch updates the state and notifies listeners', () => {
    const initialState = stateManager.getState();
    const listenerMock = jest.fn();
    
    stateManager.subscribe(listenerMock);
    
    stateManager.dispatch(() => ({
      screen: 'practice' as GameScreen
    }));
    
    // Listener should be called
    expect(listenerMock).toHaveBeenCalledTimes(1);
    
    // First argument should be new state, second should be old state
    const newState = listenerMock.mock.calls[0][0];
    const oldState = listenerMock.mock.calls[0][1];
    
    expect(newState.screen).toBe('practice');
    expect(oldState.screen).toBe(initialState.screen);
  });

  test('select allows extracting parts of the state', () => {
    const screen = stateManager.select(state => state.screen);
    expect(screen).toBe('menu');
    
    const language = stateManager.select(state => state.settings.language);
    expect(['en', 'he']).toContain(language);
  });

  test('updateSettings updates only the settings part of the state', () => {
    stateManager.updateSettings({ language: 'en' });
    
    const state = stateManager.getState();
    expect(state.settings.language).toBe('en');
    
    // Update multiple settings
    stateManager.updateSettings({ 
      language: 'he',
      difficulty: 'hard'
    });
    
    const updatedState = stateManager.getState();
    expect(updatedState.settings.language).toBe('he');
    expect(updatedState.settings.difficulty).toBe('hard');
  });

  test('updateProgress updates only the progress part of the state', () => {
    const testWords = ['apple', 'banana', 'orange'];
    
    stateManager.updateProgress({ 
      wordList: testWords,
      currentIndex: 1,
      currentWordCorrect: true
    });
    
    const state = stateManager.getState();
    expect(state.progress.wordList).toEqual(testWords);
    expect(state.progress.currentIndex).toBe(1);
    expect(state.progress.currentWordCorrect).toBe(true);
  });

  test('setScreen updates only the screen part of the state', () => {
    stateManager.setScreen('practice');
    
    const state = stateManager.getState();
    expect(state.screen).toBe('practice');
    
    stateManager.setScreen('summary');
    expect(stateManager.getState().screen).toBe('summary');
  });

  test('resetProgress resets the progress state', () => {
    // First set some progress
    stateManager.updateProgress({
      currentIndex: 5,
      currentWordCorrect: true,
      attempts: { 0: 1, 1: 2 }
    });
    
    // Now reset
    const testWords = ['cat', 'dog'];
    stateManager.resetProgress(testWords);
    
    const state = stateManager.getState();
    expect(state.progress.currentIndex).toBe(0);
    expect(state.progress.wordList).toEqual(testWords);
    expect(state.progress.attempts).toEqual({});
    expect(state.progress.wrongAttempts).toEqual({});
    expect(state.progress.currentWordCorrect).toBe(false);
  });

  test('unsubscribe removes a listener', () => {
    const listenerMock = jest.fn();
    
    const unsubscribe = stateManager.subscribe(listenerMock);
    
    // Dispatch to trigger listener
    stateManager.dispatch(() => ({ screen: 'practice' as GameScreen }));
    expect(listenerMock).toHaveBeenCalledTimes(1);
    
    // Unsubscribe
    unsubscribe();
    
    // Dispatch again, listener should not be called
    stateManager.dispatch(() => ({ screen: 'menu' as GameScreen }));
    expect(listenerMock).toHaveBeenCalledTimes(1);
  });
});