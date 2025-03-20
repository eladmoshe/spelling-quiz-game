# Spelling Quiz Game Specifications

## Game Overview
An interactive spelling quiz application that helps users learn and practice spelling words in both English and Hebrew.

## Core Features

### Language Support
- Bilingual support: English and Hebrew
- Language toggle functionality
- Localization of all UI elements and instructions

### Word Generation
- Word lists categorized by difficulty levels:
  - Easy (3-6 letter words)
  - Medium (TBD)
  - Hard (TBD)
- Randomized word selection from predefined word lists

### Game Mechanics
1. Word Spelling
   - Users attempt to spell a spoken word
   - Multiple attempts allowed per word
   - Provides hints for incorrect spellings
   - Tracks attempts and accuracy for each word
   - Disabled mobile keyboard autocomplete to ensure users spell words manually
   - Prevents automatic suggestions and corrections

2. Input Methods
   - Manual text input
   - Potential future support for voice/keyboard input

3. Word Pronunciation
   - Text-to-Speech (TTS) support
   - Primary method: Azure TTS
   - Fallback: Browser speech synthesis
   - Supports both slow and normal speech rates
   - Language-specific pronunciation

### Game Settings
- Configurable settings saved in localStorage:
  - Language preference
  - Difficulty level
  - Number of words per quiz
  - Input mode

### Performance and UX
- 1-second cooldown between word plays
- Responsive design
- Accessibility considerations
- Error handling for speech synthesis
- Enhanced progress indicators:
  - Interactive circular indicators for each word
  - Linear progress bar showing overall completion
  - Visual cues for current, completed, and pending words

### Analytics and Tracking
- Google Analytics for basic web traffic tracking
- Microsoft Clarity for user behavior insights and heatmaps
- Anonymous tracking to understand user interactions
- No personally identifiable information collected
- Configurable consent management
- Bot detection enabled by default
- Event logging for game interactions
- Optional user identification for advanced tracking

## Edge Cases and Error Handling

### Word Matching
1. Case Insensitivity
   - Convert user input and correct word to lowercase before comparison
   - Ignore case differences

2. Length Variations
   - Handle words of different lengths
   - Identify first incorrect letter
   - Provide appropriate feedback

3. Special Characters and Spaces
   - TBD: Handling of special characters
   - Potential normalization of input

### Speech Synthesis
1. Fallback Mechanisms
   - If Azure TTS fails, use browser speech synthesis
   - Graceful error logging
   - Prevent game interruption

2. Language-Specific Pronunciation
   - Explicit language tag for TTS
   - Separate configurations for English (en-US) and Hebrew (he-IL)

### Game State Management
1. localStorage Persistence
   - Save and restore game settings
   - Store previous word sets
   - Limit stored sets to prevent excessive storage

2. Error Prevention
   - Validate localStorage data
   - Provide default values if data is corrupted

## Build and Deployment
- Deployed on GitHub Pages
- Base URL: `/spelling-quiz-game/`
- Built and deployed using GitHub Actions
- Build validation system prevents deployment issues
- TypeScript as primary language
- All source code under `js/` directory

### Build Validation
The project includes a comprehensive validation system that:
- Validates build output for GitHub Pages compatibility
- Detects path resolution issues and MIME type problems
- Simulates GitHub Pages constraints to test deployments
- Prevents broken builds from being deployed

## Future Improvements
- Add medium and hard difficulty levels
- Implement more comprehensive word lists
- Add voice input support
- Enhance accessibility features
- Implement user progress tracking

## Testing Strategy
- Unit tests for core components:
  - Word Matching
  - Word Generation
  - Speech Services
  - Game Logic
- Integration tests for game flow
- Cross-browser compatibility testing

## Performance Optimization
- Lazy loading of speech synthesis modules
- Minimal localStorage usage
- Efficient word generation and matching algorithms

## Accessibility Considerations
- Screen reader support
- High contrast mode
- Keyboard navigation
- Localized error messages and instructions

## Security Considerations
- No sensitive data storage
- Client-side only application
- Minimal external dependencies
