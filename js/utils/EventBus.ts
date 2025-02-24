type EventCallback = (...args: any[]) => void;

export class EventBus {
  private static instance: EventBus;
  private events: Map<string, EventCallback[]>;

  private constructor() {
    this.events = new Map();
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Subscribe to an event
   * @param event Event name
   * @param callback Callback function
   * @returns Unsubscribe function
   */
  public on(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    const callbacks = this.events.get(event)!;
    callbacks.push(callback);
    
    return () => {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Emit an event with payload
   * @param event Event name
   * @param args Arguments to pass to callbacks
   */
  public emit(event: string, ...args: any[]): void {
    if (!this.events.has(event)) {
      return;
    }
    
    const callbacks = this.events.get(event)!;
    callbacks.forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event '${event}' callback:`, error);
      }
    });
  }

  /**
   * Subscribe to an event and unsubscribe after first trigger
   * @param event Event name
   * @param callback Callback function 
   */
  public once(event: string, callback: EventCallback): void {
    const unsubscribe = this.on(event, (...args: any[]) => {
      callback(...args);
      unsubscribe();
    });
  }

  /**
   * Remove all event listeners
   * @param event Optional event name. If not provided, all events are cleared
   */
  public clear(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

export default EventBus;