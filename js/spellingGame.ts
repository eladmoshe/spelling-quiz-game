/**
 * Main application entry point
 * Initializes the application and connects all components
 */
import { GameEngine } from './core/GameEngine';
import MenuComponent from './components/MenuComponent';
import GameBoardComponent from './components/GameBoardComponent';
import SummaryComponent from './components/SummaryComponent';
import { translations } from './i18n/translations';

declare global {
  interface Window {
    game: SpellingApp;
  }
}

// Class definition without any export keywords
class SpellingApp {
  private gameEngine!: GameEngine;
  private menuComponent!: MenuComponent;
  private gameBoardComponent!: GameBoardComponent;
  private summaryComponent!: SummaryComponent;

  constructor() {
    this.initialize();
  }

  /**
   * Initializes the application
   */
  private initialize(): void {
    // Get app element
    const appElement = document.getElementById('app');
    if (!appElement) {
      throw new Error('App element not found');
    }

    // Initialize services
    this.gameEngine = GameEngine.getInstance();

    // Initialize components
    this.menuComponent = new MenuComponent('app');
    this.gameBoardComponent = new GameBoardComponent('app');
    this.summaryComponent = new SummaryComponent('app');

    // Subscribe to state changes
    this.subscribeToStateChanges();

    // Set up additional event listeners
    this.setupEventListeners();

    // Initial render
    this.render();
  }

  /**
   * Subscribes to state changes
   */
  private subscribeToStateChanges(): void {
    // Subscribe to game state changes to update the UI
    const eventBus = this.gameEngine.getEventBus();
    
    eventBus.on('stateChanged', () => {
      this.render();
    });

    eventBus.on('gameStarted', () => {
      // Play the first word after a delay - increased for better test reliability
      setTimeout(() => {
        try {
          this.gameEngine.playCurrentWord();
        } catch (error) {
          console.error('Error playing word on game start:', error);
        }
      }, 500);
    });

    // Listen for word changes to ensure the DOM updates properly
    eventBus.on('wordChanged', () => {
      // Ensure we render again after word changes
      setTimeout(() => {
        // Clear any input fields that might be showing
        const answerInput = document.getElementById('answerInput') as HTMLInputElement;
        if (answerInput) {
          answerInput.value = '';
        }
        // Trigger a re-render
        this.render();
      }, 50);
    });
    
    // Special event for test reliability
    eventBus.on('loadingPreviousSet', (index) => {
      // Force an immediate render cycle when loading a previous set
      console.log(`Loading previous set ${index} for tests`);
      // Wait a bit longer to ensure tests don't fail
      setTimeout(() => {
        // Force render multiple times to ensure it completes
        this.render();
        setTimeout(() => this.render(), 500);
        setTimeout(() => this.render(), 1000);
      }, 200);
    });

    eventBus.on('gameCompleted', () => {
      // Create confetti effect when game is completed
      this.createConfetti();
    });

    // Set up global language toggle
    eventBus.on('languageChanged', () => {
      this.updateFeedbackPanel();
    });
  }

  /**
   * Sets up additional event listeners
   */
  private setupEventListeners(): void {
    // Set up language toggle
    const languageToggle = document.getElementById('languageToggle');
    if (languageToggle) {
      languageToggle.addEventListener('click', () => {
        this.gameEngine.toggleLanguage();
      });
    }

    // Setup feedback button and panel
    document.addEventListener('DOMContentLoaded', () => {
      const feedbackButton = document.getElementById('feedbackButton');
      const feedbackPanel = document.getElementById('feedbackPanel');

      if (feedbackButton && feedbackPanel) {
        // Initial setup
        this.updateFeedbackPanel();

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
      }
    });
  }

  /**
   * Renders the appropriate component based on current state
   */
  private render(): void {
    const state = this.gameEngine.getState();
    
    switch (state.screen) {
      case 'menu':
        this.menuComponent.render();
        break;
      case 'practice':
        this.gameBoardComponent.render();
        break;
      case 'summary':
        this.summaryComponent.render();
        break;
      default:
        this.menuComponent.render();
    }
  }

  /**
   * Updates the feedback panel content based on current language
   */
  private updateFeedbackPanel(): void {
    const feedbackPanel = document.getElementById('feedbackPanel');
    if (!feedbackPanel) return;

    const state = this.gameEngine.getState();
    const t = translations[state.settings.language];
    
    feedbackPanel.innerHTML = `
      <h3>${t.title}</h3>
      <p>Written by Elad Moshe</p>
      <a href="mailto:eladmoshe@gmail.com">${t.sendFeedback || 'Send Feedback'}</a>
    `;
  }

  /**
   * Creates confetti effect when game is completed
   */
  private createConfetti(): void {
    const shapes = ['square', 'triangle', 'circle'];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.className = `confetti ${shapes[Math.floor(Math.random() * shapes.length)]}`;
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = `${Math.random() * 2}s`;
      confetti.style.animationDuration = `${3 + Math.random() * 2}s`;
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 5000);
    }
  }

  /**
   * Gets the current language
   * @returns Current language
   */
  public getLanguage(): 'en' | 'he' {
    return this.gameEngine.getState().settings.language;
  }

  /**
   * Loads a previous word set
   * @param index Index of the word set to load
   */
  public loadPreviousSet(index: number): void {
    this.gameEngine.loadPreviousSet(index);
  }

  /**
   * Toggles the language
   */
  public toggleLanguage(): void {
    this.gameEngine.toggleLanguage();
  }
}

// Also export as default for easier importing
export default SpellingApp;