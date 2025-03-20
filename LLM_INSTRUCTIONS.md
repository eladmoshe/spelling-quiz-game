# SpellingQuiz LLM Instructions

This document serves as a quick reference for LLMs working with the SpellingQuiz codebase. It provides context, architecture overview, and guidance to help you quickly understand the project.

> **Important**: Performance testing is not supported in this project. The test suite focuses on functional correctness rather than performance benchmarks. The `tests/performance.spec.ts` file is kept as a placeholder but does not contain active tests.

## Project Overview

SpellingQuiz is an interactive web application designed to help users practice and improve their English spelling skills. Key features include:

- Interactive spelling practice with text-to-speech pronunciation
- Bilingual support (English and Hebrew) with RTL/LTR switching
- Word matching and validation with feedback
- Progress tracking and end-of-game statistics
- Local storage for saving user preferences and word sets

## Architecture

The project follows a modular architecture with clear separation of concerns:

### Core Components
- **GameEngine** (`js/core/GameEngine.ts`): Central controller orchestrating game flow
- **WordGenerator** (`js/core/WordGenerator.ts`): Generates word lists
- **WordMatcher** (`js/core/WordMatcher.ts`): Validates user input against correct spelling

### UI Components
- **MenuComponent** (`js/components/MenuComponent.ts`): Game menu and settings
- **GameBoardComponent** (`js/components/GameBoardComponent.ts`): Main gameplay interface
- **SummaryComponent** (`js/components/SummaryComponent.ts`): End-of-game statistics

### Services
- **StorageService** (`js/services/StorageService.ts`): Manages localStorage persistence
- **SpeechService** (`js/services/SpeechService.ts`): Handles text-to-speech functionality
- **AnalyticsService** (`js/services/AnalyticsService.ts`): Tracks user interactions

### Utilities
- **StateManager** (`js/utils/StateManager.ts`): Manages application state
- **EventBus** (`js/utils/EventBus.ts`): Facilitates pub/sub communication between components

### Models
- **GameState** (`js/models/GameState.ts`): Data models and interfaces
- **WordModel** (`js/models/WordModel.ts`): Word-related data structures

## Key Design Patterns

1. **Singleton Pattern**: Used for services and utilities that should have only one instance
2. **Observer Pattern**: Implemented via EventBus for component communication
3. **State Pattern**: Centralized state management with StateManager
4. **Factory Pattern**: Used in WordGenerator for creating different word sets

## App Flow

1. User starts at the menu screen where they can:
   - Enter custom words for practice
   - Choose from previous word sets
   - Toggle language (English/Hebrew)
   - Select difficulty level (for random word generation)

2. During gameplay:
   - Words are spoken via text-to-speech
   - User types their spelling attempt
   - Feedback is provided on correctness
   - Progress is tracked and displayed

3. After completing all words:
   - Summary screen shows performance statistics
   - User can restart or return to menu

## Build and Test

- Built with TypeScript and bundled with Vite
- Unit tests use Jest
- E2E tests use Playwright
- Build validation system prevents deployment issues
- Continuous integration with GitHub Actions
- Deployed on GitHub Pages

### Build Validation System

The project includes a comprehensive build validation system to prevent deployment issues:

- **scripts/validate-build.js**: Validates build output for issues that would break in production
- **scripts/simulate-deployment.js**: Simulates GitHub Pages constraints and tests the built app
- **scripts/production-build.js**: Runs the complete build and validation process

These scripts are available through npm commands:

```bash
npm run build:prod   # Production build with validation
npm run validate     # Validate an existing build
npm run simulate     # Simulate GitHub Pages deployment
```

The CI/CD pipeline is configured to use these scripts to prevent problematic deployments.

## Common Tasks

### Adding a New Feature

1. Determine which component(s) need modification
2. Update relevant models/interfaces if needed
3. Implement the feature following established patterns
4. Add appropriate event emissions/subscriptions if the feature affects multiple components
5. Write tests to cover the new functionality
6. Update the build if necessary

### Fixing Bugs

1. Locate the issue in the relevant component/service
2. Check the tests to understand expected behavior
3. Fix the issue while maintaining existing patterns and conventions
4. Add a regression test if appropriate

### Working with State

The application uses a centralized state manager:

```typescript
// Get current state
const state = StateManager.getInstance().getState();

// Update settings
StateManager.getInstance().updateSettings({ language: 'en' });

// Update game progress
StateManager.getInstance().updateProgress({ currentIndex: 2 });

// Subscribe to state changes
StateManager.getInstance().subscribe((newState, oldState) => {
  // Handle state change
});
```

### Working with Events

Components communicate via the EventBus:

```typescript
// Subscribe to an event
EventBus.getInstance().on('wordChanged', (index) => {
  // Handle word change
});

// Emit an event
EventBus.getInstance().emit('gameCompleted', gameStats);
```

## Pending Improvements

1. Medium and hard difficulty levels (marked as TBD in specs)
2. More comprehensive word lists
3. Voice input support
4. Enhanced accessibility features
5. Special character handling in word matching

## Updating This Document

**IMPORTANT**: This document should be kept up-to-date as the project evolves. When making significant changes to the codebase, please update this document to reflect those changes.

Updates should include:
- New components or services added
- Changes to the architecture or design patterns
- New features or functionality
- Deprecated or removed functionality
- Updated build or deployment processes

By keeping this document current, you'll help future LLMs quickly understand the project context and make better-informed contributions.

## Additional Resources

- See `README.md` for user-facing documentation
- See `Specs.md` for detailed specifications
- See test files (*.test.ts) for expected behavior of components
