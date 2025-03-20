// Import from the TypeScript file and re-export
// This file serves as a bridge when referenced directly from HTML
import initApp, * as exports from './index.ts';

// Initialize the application
window.addEventListener('DOMContentLoaded', () => {
  initApp();
});

// Re-export everything from the TypeScript file
export default initApp;
export const {
  SpellingApp,
  GameEngine,
  WordMatcher,
  WordGenerator,
  StateManager,
  EventBus,
  StorageService,
  SpeechService,
  AnalyticsService,
  translations
} = exports;