import App from './app';

// Import all modules
import { GameEngine } from './core/GameEngine';
import { WordMatcher } from './core/WordMatcher';
import { WordGenerator } from './core/WordGenerator';
import { StateManager } from './utils/StateManager';
import { EventBus } from './utils/EventBus';
import { StorageService } from './services/StorageService';
import { SpeechService } from './services/SpeechService';
import { AnalyticsService } from './services/AnalyticsService';
import { translations } from './i18n/translations';

// Export for module use
export {
  App,
  GameEngine,
  WordMatcher,
  WordGenerator,
  StateManager,
  EventBus,
  StorageService,
  SpeechService,
  AnalyticsService,
  translations
};

// Default export for direct script tag use
export default App;