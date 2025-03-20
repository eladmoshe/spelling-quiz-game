/**
 * Simple event bus for application-wide communication
 */
export class EventBus {
  private static instance: EventBus;
  private events: Map<string, Array<(data?: any) => void>>;

  /**
   * Create a new event bus
   */
  private constructor() {
    this.events = new Map();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Subscribe to an event
   * @param eventName Event name to subscribe to
   * @param callback Function to call when event is emitted
   * @returns Unsubscribe function
   */
  public on(eventName: string, callback: (data?: any) => void): () => void {
    // Create event array if it doesn't exist
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }

    // Add callback to event array
    const handlers = this.events.get(eventName)!;
    handlers.push(callback);

    // Return unsubscribe function
    return () => {
      this.off(eventName, callback);
    };
  }

  /**
   * Emit an event
   * @param eventName Event name to emit
   * @param args Arguments to pass to event handlers
   */
  public emit(eventName: string, ...args: any[]): void {
    // Get event handlers
    const handlers = this.events.get(eventName);

    // If no handlers, do nothing
    if (!handlers) return;

    // Call each handler with all arguments
    handlers.forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event handler for ${eventName}:`, error);
      }
    });
  }

  /**
   * Unsubscribe from an event
   * @param eventName Event name to unsubscribe from
   * @param callback Function to remove from event handlers
   */
  public off(eventName: string, callback: (data?: any) => void): void {
    // Get event handlers
    const handlers = this.events.get(eventName);

    // If no handlers, do nothing
    if (!handlers) return;

    // Filter out the callback
    const filteredHandlers = handlers.filter(handler => handler !== callback);

    // Update event handlers
    if (filteredHandlers.length > 0) {
      this.events.set(eventName, filteredHandlers);
    } else {
      this.events.delete(eventName);
    }
  }

  /**
   * Clear all event handlers for a specific event
   * @param eventName Event name to clear handlers for
   */
  public clear(eventName?: string): void {
    if (eventName) {
      // Clear specific event
      this.events.delete(eventName);
    } else {
      // Clear all events
      this.events.clear();
    }
  }

  /**
   * Get the number of handlers for a specific event
   * @param eventName Event name to get handler count for
   * @returns Number of handlers
   */
  public listenerCount(eventName: string): number {
    const handlers = this.events.get(eventName);
    return handlers ? handlers.length : 0;
  }

  /**
   * Subscribe to an event once
   * @param eventName Event name to subscribe to
   * @param callback Function to call when event is emitted
   * @returns Unsubscribe function
   */
  public once(eventName: string, callback: (data?: any) => void): () => void {
    const onceWrapper = (...args: any[]) => {
      this.off(eventName, onceWrapper);
      callback(...args);
    };
    return this.on(eventName, onceWrapper);
  }
}

export default EventBus;