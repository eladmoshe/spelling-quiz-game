import SpellingApp from './spellingGame';

// Export a default function to initialize the app
export default function initApp() {
  // Create and initialize the game instance
  try {
    console.log('Loading SpellingQuiz application...');
    window.game = new SpellingApp();
    return window.game;
  } catch (error) {
    console.error('Error initializing SpellingQuiz:', error);
    document.getElementById('app')!.innerHTML = `
      <div class="error-message" style="color: red; padding: 2rem; text-align: center;">
        <h2>Error Loading Application</h2>
        <p>${error instanceof Error ? error.message : String(error)}</p>
      </div>
    `;
    throw error;
  }
}

// Automatically initialize when loaded as a module
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    initApp();
  });
}