import { GameEngine } from './core/GameEngine';

jest.mock('./core/GameEngine');

jest.mock('./components/MenuComponent', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({ render: jest.fn() }))
}));

jest.mock('./components/GameBoardComponent', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({ render: jest.fn() }))
}));

jest.mock('./components/SummaryComponent', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({ render: jest.fn() }))
}));

describe('Feedback panel behavior', () => {
  let mockGameEngine: any;
  let mockEventBus: any;
  let SpellingApp: any;

  beforeEach(async () => {
    document.body.innerHTML = `
      <div id="app"></div>
      <div id="feedbackButton">?</div>
      <div id="feedbackPanel"></div>
    `;

    mockEventBus = {
      on: jest.fn().mockReturnValue(() => {}),
      emit: jest.fn()
    };

    mockGameEngine = {
      getEventBus: jest.fn().mockReturnValue(mockEventBus),
      getState: jest.fn().mockReturnValue({
        screen: 'menu',
        settings: { language: 'en' },
        lastPlayTime: 0,
        progress: { currentIndex: 0, wordList: [], attempts: {}, wrongAttempts: {}, currentWordCorrect: false }
      }),
      toggleLanguage: jest.fn(),
      playCurrentWord: jest.fn(),
      loadPreviousSet: jest.fn()
    };

    (GameEngine.getInstance as jest.Mock).mockReturnValue(mockGameEngine);
    jest.unmock('./spellingGame');
    const mod = await import('./spellingGame');
    SpellingApp = mod.default;
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  test('clicking feedback button toggles panel visibility', () => {
    new SpellingApp();

    const feedbackButton = document.getElementById('feedbackButton') as HTMLElement;
    const feedbackPanel = document.getElementById('feedbackPanel') as HTMLElement;

    expect(feedbackPanel.classList.contains('visible')).toBe(false);
    feedbackButton.click();
    expect(feedbackPanel.classList.contains('visible')).toBe(true);
    feedbackButton.click();
    expect(feedbackPanel.classList.contains('visible')).toBe(false);
  });
});
