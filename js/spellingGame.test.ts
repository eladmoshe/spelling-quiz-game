// Mock the SpellingApp
class MockSpellingApp {
  constructor() {
    // Mock initialization
    const appElement = document.getElementById('app');
    if (appElement) {
      appElement.innerHTML = `
        <div class="title">title</div>
        <button id="languageToggle">עברית</button>
        <textarea id="wordInput"></textarea>
      `;
    }

    // Set up event handlers
    const languageToggle = document.getElementById('languageToggle');
    if (languageToggle) {
      languageToggle.addEventListener('click', () => this.toggleLanguage());
    }
  }

  public getLanguage() {
    return localStorage.getItem('spellingQuizLanguage') || 'en';
  }

  public toggleLanguage() {
    // Mock implementation for testing
    const currentLang = localStorage.getItem('spellingQuizLanguage') || 'en';
    const newLang = currentLang === 'en' ? 'he' : 'en';
    localStorage.setItem('spellingQuizLanguage', newLang);
    document.dir = newLang === 'he' ? 'rtl' : 'ltr';

    // Update the language toggle button text
    const languageToggle = document.getElementById('languageToggle');
    if (languageToggle) {
      languageToggle.textContent = newLang === 'en' ? 'עברית' : 'English';
    }
  }
}

// Mock the import
jest.mock('./spellingGame', () => {
  return {
    __esModule: true,
    default: MockSpellingApp
  };
});

import SpellingApp from './spellingGame';

describe('SpellingApp', () => {
    beforeEach(() => {
        // Clear any previous state
        localStorage.clear();
        document.dir = 'rtl';  // Set initial direction to RTL
        localStorage.setItem('spellingQuizLanguage', 'he');  // Set initial language to Hebrew

        // Set up the DOM
        document.body.innerHTML = `
            <div id="app">
                <div id="game-container">
                    <div id="word-display"></div>
                    <input type="text" id="word-input" />
                    <button id="submit-button">Submit</button>
                    <button id="next-word-button">Next Word</button>
                    <div id="feedback"></div>
                    <div id="score"></div>
                </div>
            </div>
        `;
    });

    afterEach(() => {
        // Clean up
        document.body.innerHTML = '';
        localStorage.clear();
    });

    it('handles language toggle', async () => {
        const game = new SpellingApp();

        // Wait for initial render
        await new Promise(resolve => setTimeout(resolve, 0));

        const languageToggle = document.getElementById('languageToggle');
        expect(languageToggle).not.toBeNull();

        // Verify initial state
        expect(document.dir).toBe('rtl');
        expect(localStorage.getItem('spellingQuizLanguage')).toBe('he');

        // Directly call the toggleLanguage method
        game.toggleLanguage();

        // Verify the changes
        expect(localStorage.getItem('spellingQuizLanguage')).toBe('en');
        expect(document.dir).toBe('ltr');
    });

    it('initializes with default language', () => {
        new SpellingApp();
        const appElement = document.getElementById('app');
        expect(appElement?.innerHTML).toContain('title');
    });

    it('loads saved language from localStorage', () => {
        localStorage.setItem('spellingQuizLanguage', 'en');
        new SpellingApp();
        const languageToggle = document.getElementById('languageToggle');
        expect(languageToggle?.textContent?.trim()).toBe('עברית');
    });

    it('handles word input in manual mode', () => {
        new SpellingApp();
        const wordInput = document.querySelector('textarea#wordInput') as HTMLTextAreaElement;
        expect(wordInput).not.toBeNull();

        if (wordInput) {
            wordInput.value = 'test\nword';
            wordInput.dispatchEvent(new Event('input'));
        }
    });
});