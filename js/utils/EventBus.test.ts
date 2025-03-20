import { EventBus } from './EventBus';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    // Reset the singleton between tests
    jest.resetModules();
    // Reset the static instance
    Object.defineProperty(EventBus, 'instance', {
      value: undefined,
      writable: true
    });
    eventBus = EventBus.getInstance();
  });

  test('getInstance returns a singleton instance', () => {
    const instance1 = EventBus.getInstance();
    const instance2 = EventBus.getInstance();
    expect(instance1).toBe(instance2);
  });

  test('on registers an event listener', () => {
    const callback = jest.fn();
    eventBus.on('test-event', callback);
    
    eventBus.emit('test-event', 'test-data');
    expect(callback).toHaveBeenCalledWith('test-data');
  });

  test('on returns an unsubscribe function', () => {
    const callback = jest.fn();
    const unsubscribe = eventBus.on('test-event', callback);
    
    eventBus.emit('test-event');
    expect(callback).toHaveBeenCalledTimes(1);
    
    unsubscribe();
    eventBus.emit('test-event');
    expect(callback).toHaveBeenCalledTimes(1); // Still 1, not called again
  });

  test('emit triggers all registered listeners for an event', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    
    eventBus.on('test-event', callback1);
    eventBus.on('test-event', callback2);
    
    eventBus.emit('test-event', 'data');
    
    expect(callback1).toHaveBeenCalledWith('data');
    expect(callback2).toHaveBeenCalledWith('data');
  });

  test('emit can pass multiple arguments', () => {
    const callback = jest.fn();
    eventBus.on('test-event', callback);
    
    eventBus.emit('test-event', 'arg1', 2, { key: 'value' });
    
    expect(callback).toHaveBeenCalledWith('arg1', 2, { key: 'value' });
  });

  test('emit does nothing if no listeners are registered', () => {
    // This should not throw
    expect(() => {
      eventBus.emit('non-existent-event');
    }).not.toThrow();
  });

  test('once registers a one-time event listener', () => {
    const callback = jest.fn();
    
    eventBus.once('test-event', callback);
    
    eventBus.emit('test-event', 'first');
    expect(callback).toHaveBeenCalledWith('first');
    expect(callback).toHaveBeenCalledTimes(1);
    
    eventBus.emit('test-event', 'second');
    expect(callback).toHaveBeenCalledTimes(1); // Still 1, not called again
  });

  test('clear removes all listeners for an event', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    
    eventBus.on('event1', callback1);
    eventBus.on('event2', callback2);
    
    eventBus.clear('event1');
    
    eventBus.emit('event1');
    eventBus.emit('event2');
    
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();
  });

  test('clear without arguments removes all listeners for all events', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    
    eventBus.on('event1', callback1);
    eventBus.on('event2', callback2);
    
    eventBus.clear();
    
    eventBus.emit('event1');
    eventBus.emit('event2');
    
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
  });

  test('error in listener does not prevent other listeners from being called', () => {
    const errorCallback = jest.fn().mockImplementation(() => {
      throw new Error('Test error');
    });
    const normalCallback = jest.fn();
    
    // Suppress console.error for this test
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    eventBus.on('test-event', errorCallback);
    eventBus.on('test-event', normalCallback);
    
    eventBus.emit('test-event');
    
    expect(errorCallback).toHaveBeenCalled();
    expect(normalCallback).toHaveBeenCalled();
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});