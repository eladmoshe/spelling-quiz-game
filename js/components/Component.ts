import { EventBus } from '../utils/EventBus.js';
import { StateManager } from '../utils/StateManager.js';

export abstract class Component {
  protected element: HTMLElement | null = null;
  protected stateManager: StateManager;
  protected eventBus: EventBus;
  protected unsubscribeFunctions: (() => void)[] = [];
  
  constructor(protected readonly containerId: string) {
    this.stateManager = StateManager.getInstance();
    this.eventBus = EventBus.getInstance();
    this.initialize();
  }
  
  /**
   * Initialize the component
   */
  protected initialize(): void {
    // Get the container element
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container with ID '${this.containerId}' not found.`);
      return;
    }
    
    this.element = container;
    
    // Subscribe to state changes
    const unsubscribe = this.stateManager.subscribe(() => {
      this.render();
    });
    
    this.unsubscribeFunctions.push(unsubscribe);
  }
  
  /**
   * Clean up event listeners and subscriptions
   */
  public destroy(): void {
    // Unsubscribe from all subscriptions
    this.unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    this.unsubscribeFunctions = [];
    
    // Remove event listeners if any
    this.removeEventListeners();
  }
  
  /**
   * Render the component
   */
  public abstract render(): void;
  
  /**
   * Set up event listeners
   */
  protected abstract setupEventListeners(): void;
  
  /**
   * Remove event listeners
   */
  protected removeEventListeners(): void {
    // Base implementation does nothing
    // Subclasses should override this method if they add event listeners
  }
  
  /**
   * Helper method to safely get an element by selector within the component
   * @param selector CSS selector to find the element
   * @returns HTMLElement or null if not found
   */
  protected getElement<T extends HTMLElement>(selector: string): T | null {
    if (!this.element) return null;
    return this.element.querySelector<T>(selector);
  }
  
  /**
   * Helper method to safely get all elements matching a selector within the component
   * @param selector CSS selector to find elements
   * @returns NodeListOf<HTMLElement> or empty NodeList if none found
   */
  protected getAllElements<T extends HTMLElement>(selector: string): NodeListOf<T> {
    if (!this.element) return document.querySelectorAll<T>('');
    return this.element.querySelectorAll<T>(selector);
  }
}

export default Component;