import Component from './Component';
import { GameEngine } from '../core/GameEngine';
import { translations } from '../i18n/translations';

export class SummaryComponent extends Component {
  private gameEngine: GameEngine;
  private cleanupHandlers: (() => void)[] = [];
  
  constructor(containerId: string) {
    super(containerId);
    this.gameEngine = GameEngine.getInstance();
    
    // Listen for game completion event
    const unsubscribe = this.eventBus.on('gameCompleted', () => {
      this.createConfetti();
    });
    
    this.unsubscribeFunctions.push(unsubscribe);
  }
  
  /**
   * Renders the summary component
   */
  public render(): void {
    if (!this.element) return;
    
    const state = this.gameEngine.getState();
    
    // Only render when on the summary screen
    if (state.screen !== 'summary') return;
    
    // Calculate stats
    const stats = this.gameEngine.calculateGameStats();
    
    const { language } = state.settings;
    const t = translations[language];
    
    // Determine medal based on accuracy
    const getMedal = () => {
      const { accuracy } = stats;
      if (isNaN(accuracy)) return '🌱 Start Practicing! 🌈';
      if (accuracy >= 90) return '🏆 Excellent! 🥇';
      if (accuracy >= 70) return '🎉 Great Job! 🥈';
      if (accuracy >= 50) return '👏 Good Effort! 🥉';
      return '🌱 Keep Practicing! 🌈';
    };
    
    this.element.innerHTML = `
      <div class="card summary-card">
        <div class="space-y-6">
          <h2 class="text-3xl font-bold text-center text-primary">${t.practiceComplete}</h2>
          <p class="text-center text-xl text-text-light">${t.greatJob}</p>
          
          <div class="medal-banner">
            <div class="medal-display">
              ${getMedal()}
            </div>
          </div>

          <div class="stats grid grid-cols-3 gap-4">
            <div class="stat-item text-center">
              <div class="stat-value text-3xl text-primary">${stats.totalWords || 0}</div>
              <div class="stat-label text-text-light">${t.totalWords}</div>
            </div>
            <div class="stat-item text-center">
              <div class="stat-value text-3xl text-success">${stats.perfectWords || 0}</div>
              <div class="stat-label text-text-light">${t.perfectWords}</div>
            </div>
            <div class="stat-item text-center">
              <div class="stat-value text-3xl text-secondary">${!isNaN(stats.accuracy) ? `${stats.accuracy}%` : '0%'}</div>
              <div class="stat-label text-text-light">${t.accuracy}</div>
            </div>
          </div>

          <div class="medal-breakdown">
            <h3 class="text-xl font-semibold text-center mb-4">${t.wordAttemptBreakdown}</h3>
            <div class="grid grid-cols-3 gap-4 text-center">
              <div>
                <span class="text-3xl">🥇</span>
                <div class="text-lg">${stats.oneAttemptWords || 0}</div>
                <div class="text-sm text-text-light">First Try</div>
              </div>
              <div>
                <span class="text-3xl">🥈</span>
                <div class="text-lg">${stats.twoAttemptWords || 0}</div>
                <div class="text-sm text-text-light">Second Try</div>
              </div>
              <div>
                <span class="text-3xl">🥉</span>
                <div class="text-lg">${stats.threeAttemptWords || 0}</div>
                <div class="text-sm text-text-light">Third Try</div>
              </div>
            </div>
          </div>

          <div class="flex justify-center space-x-4">
            <button id="startOver" class="btn btn-primary" data-testid="start-over-button">
              ${t.startOver}
            </button>
          </div>
        </div>
      </div>
    `;
    
    this.setupEventListeners();
  }
  
  /**
   * Sets up event listeners for the summary screen
   */
  protected setupEventListeners(): void {
    if (!this.element) return;
    
    // Clean up previous event listeners
    this.removeEventListeners();
    
    // Start over button
    const startOverButton = this.getElement('#startOver');
    if (startOverButton) {
      const handleStartOver = () => {
        this.gameEngine.resetGame();
      };
      startOverButton.addEventListener('click', handleStartOver);
      this.cleanupHandlers.push(() => startOverButton.removeEventListener('click', handleStartOver));
    }
  }
  
  /**
   * Removes all event listeners
   */
  protected removeEventListeners(): void {
    this.cleanupHandlers.forEach(cleanup => cleanup());
    this.cleanupHandlers = [];
  }
  
  /**
   * Creates confetti animation for game completion
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
      
      // Remove the confetti after animation completes
      setTimeout(() => confetti.remove(), 5000);
    }
  }
}

export default SummaryComponent;