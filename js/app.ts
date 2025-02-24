import { MenuComponent } from './components/MenuComponent';
import { GameBoardComponent } from './components/GameBoardComponent';
import { SummaryComponent } from './components/SummaryComponent';
import { GameEngine } from './core/GameEngine';
import { AnalyticsService } from './services/AnalyticsService';
import { translations } from './i18n/translations';
import Component from './components/Component';

/**
 * Main application class
 */
export class App {
  // Core services
  private readonly gameEngine: GameEngine;
  private readonly analyticsService: AnalyticsService;
  
  // @ts-expect-error Components are initialized but kept as instance variables to prevent garbage collection
  readonly #components: Component[];
  
  /**
   * Initialize the application
   */
  constructor() {
    // Initialize core components
    this.gameEngine = GameEngine.getInstance();
    this.analyticsService = AnalyticsService.getInstance();
    
    // Configure analytics (optional)
    this.analyticsService.configureClarityConsent(true);
    
    // Initialize UI components and store them to prevent garbage collection
    this.#components = [
      new MenuComponent('app'),
      new GameBoardComponent('app'),
      new SummaryComponent('app')
    ];
    
    // Initialize and render the application
    this.initializeFeedbackPanel();
  }
  
  /**
   * Initialize the feedback panel
   */
  private initializeFeedbackPanel(): void {
    document.addEventListener('DOMContentLoaded', () => {
      const feedbackButton = document.getElementById('feedbackButton');
      const feedbackPanel = document.getElementById('feedbackPanel');
      
      if (feedbackButton && feedbackPanel) {
        // Update feedback panel content based on current language
        const updateFeedbackPanel = () => {
          const state = this.gameEngine.getState();
          const currentLanguage = state.settings.language;
          const t = translations[currentLanguage];
          
          feedbackPanel.innerHTML = `
            <h3>${t.title}</h3>
            <p>Written by Elad Moshe</p>
            <a href="mailto:eladmoshe@gmail.com">${t.sendFeedback || 'Send Feedback'}</a>
          `;
        };
        
        // Initial setup
        updateFeedbackPanel();
        
        // Add click event listener with rotation
        feedbackButton.addEventListener('click', () => {
          // Add rotate class
          feedbackButton.classList.add('rotate');
          
          // Toggle panel visibility
          feedbackPanel.classList.toggle('visible');
          
          // Remove rotate class after animation completes
          setTimeout(() => {
            feedbackButton.classList.remove('rotate');
          }, 500); // Match the animation duration
        });
        
        // Close panel when clicking outside
        document.addEventListener('click', (event) => {
          if (
            feedbackPanel.classList.contains('visible') &&
            !feedbackButton.contains(event.target as Node) &&
            !feedbackPanel.contains(event.target as Node)
          ) {
            feedbackPanel.classList.remove('visible');
          }
        });
        
        // Listen for language changes to update panel
        const eventBus = this.gameEngine.getEventBus();
        eventBus.on('languageChanged', () => {
          updateFeedbackPanel();
        });
      }
    });
  }
  
  // Note: Each component handles its own rendering based on state changes
}

// Export the game for global access
declare global {
  interface Window {
    app: App;
  }
}

// Initialize the application when running in a browser
if (typeof window !== 'undefined' && typeof process === 'undefined') {
  window.app = new App();
}

export default App;