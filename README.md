# Spelling Quiz Game 🎯

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/eladmoshe/spelling-quiz-game)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-ISC-blue)](LICENSE)

Try it now: [Spelling Quiz Game](https://eladmoshe.github.io/spelling-quiz-game/) 🎮

Welcome to Spelling Quiz - an interactive and engaging way to improve your spelling skills! This game makes practicing English spelling fun and effective.

## Preventing Deployment Issues 🔍

Spelling Quiz includes a comprehensive build validation system to ensure deployments work correctly:

- **Build Validation**: Catches issues that would break the app in production
- **Deployment Simulation**: Tests the built app with GitHub Pages constraints
- **CI Integration**: Validates builds during continuous integration

To ensure your changes will work in production:

```bash
npm run build:prod     # Runs validation and simulation

# Individual validation steps
npm run validate      # Validates build output
npm run simulate      # Simulates GitHub Pages deployment
npm run test:simulation # Tests ES modules configuration

# First-time setup
chmod +x scripts/make-executable.sh
./scripts/make-executable.sh   # Makes scripts executable
```

This prevents common deployment issues like:
- TypeScript references that won't work in production
- Path resolution problems with GitHub Pages base URL
- MIME type inconsistencies
- Missing configuration files

> **Note:** Performance tests are not supported and have been disabled in this project. The test suite focuses on functional correctness rather than performance benchmarks.

## Why Use Spelling Quiz? ✨

- **Learn at Your Own Pace**: Practice spelling with words that matter to you
- **Bilingual Support**: Available in both English and Hebrew interface
- **Interactive Learning**: Hear the words pronounced and type them out
- **Immediate Feedback**: Know instantly if your spelling is correct
- **Track Your Progress**: See how well you're doing with each practice session

## How to Use 🎮

1. **Start a New Quiz**:
   - Enter your practice words separated by commas. 
   - Click "Start" to begin
   
2. **During the Quiz**:
   - The word will be played. Click "Listen" to hear the word again
   - Type your answer
   - Press Enter or click "Check" to verify your spelling
   - Use "Next" to move to the next word

3. **Practice Features**:
   - Get instant feedback on your spelling
   - Review previous word sets
   - Track your perfect words and overall progress
   - Switch between English and Hebrew interfaces

## Getting Started 🚀

Simply open the game in your web browser and start practicing! No installation or setup required.

## Tips for Success 💡

- Practice regularly with small sets of words
- Listen to the pronunciation carefully before typing
- Use the "Try Again" feature when you make mistakes
- Focus on specific spelling patterns to improve systematically

Happy spelling! 📚✏️

## For Developers 💻

### Project Structure

The project follows a modular architecture to maintain separation of concerns:

- **core/**: Core business logic and game mechanics
  - `GameEngine.ts`: Central game controller
  - `WordGenerator.ts`: Generates word lists based on difficulty
  - `WordMatcher.ts`: Compares and validates user inputs
  
- **components/**: UI components
  - `MenuComponent.ts`: Game menu interface
  - `GameBoardComponent.ts`: Game play interface
  - `SummaryComponent.ts`: Game summary and results

- **services/**: Application services
  - `StorageService.ts`: Local storage management
  - `SpeechService.ts`: Text-to-speech functionality
  - `AnalyticsService.ts`: Usage tracking

- **utils/**: Utility functions and helpers
  - `StateManager.ts`: State management
  - `EventBus.ts`: Event propagation system

- **models/**: Data models and interfaces

- **i18n/**: Internationalization resources

### Getting Started with Development

1. Clone the repository
```bash
git clone https://github.com/eladmoshe/spelling-quiz-game.git
cd spelling-quiz-game
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Run tests
```bash
npm test             # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run test:all     # Run all tests (unit + E2E)
```

5. Build and validate
```bash
npm run build        # Standard build
npm run build:prod   # Production build with validation
npm run validate     # Validate an existing build
npm run simulate     # Simulate GitHub Pages deployment
```
