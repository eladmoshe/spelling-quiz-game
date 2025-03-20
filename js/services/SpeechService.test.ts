import { SpeechService } from './SpeechService';

// Set timeout for all tests in this file
jest.setTimeout(30000);

describe('SpeechService', () => {
  let speechService: SpeechService;
  
  // Create mocks for both the Speech SDK and browser speech synthesis
  const mockSpeechConfig = {
    speechSynthesisVoiceName: '',
    speechSynthesisOutputFormat: '',
    speechRecognitionLanguage: '',
    speechSynthesisLanguage: '',
    fromSubscription: jest.fn().mockReturnThis()
  };
  
  // Create a result object that will be returned
  const mockResult = {
    audioData: new Uint8Array([1, 2, 3]),
    audioDataStream: { isClosed: true },
    properties: {},
    reason: 'SynthesizingAudioCompleted'
  };
  
  const mockSynthesizer = {
    speakSsmlAsync: jest.fn(),
    close: jest.fn()
  };

  const mockUtterance = {
    lang: '',
    rate: 1,
    onend: null,
    onerror: null
  };
  
  const mockSpeechSdk = {
    SpeechConfig: {
      fromSubscription: jest.fn().mockReturnValue(mockSpeechConfig)
    },
    SpeechSynthesizer: jest.fn().mockImplementation(() => mockSynthesizer),
    ResultReason: {
      SynthesizingAudioCompleted: 'SynthesizingAudioCompleted'
    },
    AudioConfig: {
      fromDefaultSpeakerOutput: jest.fn().mockReturnValue({})
    }
  };
  
  // Mock browser Speech API
  const mockSpeechSynthesis = {
    speak: jest.fn(),
    getVoices: jest.fn().mockReturnValue([])
  };
  
  // Mock SpeechSynthesisUtterance constructor
  const mockSpeechSynthesisUtterance = jest.fn().mockImplementation((text) => {
    return {
      ...mockUtterance,
      text
    };
  });
  
  // Mock Audio constructor and its methods
  const mockAudio = {
    onended: null,
    onerror: null,
    play: jest.fn().mockReturnValue({
      catch: jest.fn()
    })
  };
  
  // Mock FileReader and its methods
  const mockFileReader = {
    onloadend: null,
    result: '',
    readAsDataURL: jest.fn().mockImplementation(function() {
      // We use setTimeout to simulate async behavior
      setTimeout(() => {
        if (this.onloadend) {
          this.result = 'data:audio/wav;base64,mockBase64Data';
          this.onloadend();
        }
      }, 0);
    })
  };
  
  // Fix TypeScript errors by adding required properties to FileReader constructor
  const mockFileReaderConstructor = jest.fn().mockImplementation(() => mockFileReader);
  mockFileReaderConstructor.EMPTY = 0;
  mockFileReaderConstructor.LOADING = 1;
  mockFileReaderConstructor.DONE = 2;
  
  // Mock localStorage
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    key: jest.fn(),
    length: 0
  };
  
  beforeEach(() => {
    // Reset the singleton instance
    Object.defineProperty(SpeechService, 'instance', {
      value: undefined,
      writable: true
    });
    
    // Setup global mocks
    global.window = Object.create(window);
    Object.defineProperty(window, 'SpeechSDK', {
      value: mockSpeechSdk,
      writable: true
    });
    
    // Mock browser speech synthesis
    Object.defineProperty(window, 'speechSynthesis', {
      value: mockSpeechSynthesis,
      writable: true
    });
    
    // Mock Audio constructor
    global.Audio = jest.fn().mockImplementation(() => mockAudio);
    
    // Mock FileReader with proper static properties
    global.FileReader = mockFileReaderConstructor;
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage
    });
    
    global.SpeechSynthesisUtterance = mockSpeechSynthesisUtterance;
    
    // Set up the mock speakSsmlAsync implementation
    mockSynthesizer.speakSsmlAsync.mockImplementation((_ssml, success, _error) => {
      success(mockResult);
      return Promise.resolve(mockResult);
    });
    
    // Create a new instance with mocked dependencies
    speechService = SpeechService.getInstance();
    
    // Mock specific methods to avoid real implementation issues
    jest.spyOn(speechService, 'canPlayWord').mockReturnValue(true);
    
    // Mock private methods using Object.defineProperty
    Object.defineProperty(speechService, 'playAudio', {
      value: jest.fn().mockResolvedValue(undefined)
    });
    
    Object.defineProperty(speechService, 'speakWithAzure', {
      value: jest.fn().mockResolvedValue(undefined)
    });
    
    Object.defineProperty(speechService, 'speakWithBrowser', {
      value: jest.fn().mockResolvedValue(undefined)
    });
    
    // Mock console methods to keep tests cleaner
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('getInstance returns a singleton instance', () => {
    const instance1 = SpeechService.getInstance();
    const instance2 = SpeechService.getInstance();
    expect(instance1).toBe(instance2);
  });
  
  test('speak calls speech synthesis API', async () => {
    await speechService.speak('apple', 'en-US');
    
    // Should have tried to speak
    expect(speechService['speakWithAzure']).toHaveBeenCalledWith('apple', 'en-US', 1.0);
  });
  
  test('speak with slow rate sets correct rate value', async () => {
    await speechService.speak('banana', 'en-US', 'slow');
    
    // Check that the normalized rate was passed to speakWithAzure
    expect(speechService['speakWithAzure']).toHaveBeenCalledWith('banana', 'en-US', 0.7);
  });
  
  test('canPlayWord respects cooldown period', () => {
    // Restore original method for this test
    jest.restoreAllMocks();
    
    // Set a recent play time
    Object.defineProperty(speechService, 'lastPlayTime', {
      value: Date.now(),
      writable: true
    });
    
    // Should be in cooldown
    expect(speechService.canPlayWord()).toBe(false);
    
    // Set play time in the past
    Object.defineProperty(speechService, 'lastPlayTime', {
      value: Date.now() - 10000, // 10 seconds ago
      writable: true
    });
    
    // Should be able to play again
    expect(speechService.canPlayWord()).toBe(true);
  });
  
  test('getCooldownTimeRemaining returns correct time', () => {
    // No cooldown initially
    expect(speechService.getCooldownTimeRemaining()).toBe(0);
    
    // Set a recent play time
    const now = Date.now();
    Object.defineProperty(speechService, 'lastPlayTime', {
      value: now,
      writable: true
    });
    
    // Access and modify the private PLAY_COOLDOWN_MS property
    Object.defineProperty(speechService, 'PLAY_COOLDOWN_MS', {
      value: 5000, // 5 seconds
      writable: true
    });
    
    // Mock Date.now to return a consistent value
    const originalDateNow = Date.now;
    Date.now = jest.fn().mockReturnValue(now + 2000); // 2 seconds later
    
    // Should have 3 seconds remaining (5 - 2 = 3)
    expect(speechService.getCooldownTimeRemaining()).toBe(3000);
    
    // Restore Date.now
    Date.now = originalDateNow;
  });
  
  test('handles synthesis errors gracefully', async () => {
    // Mock speakWithAzure to throw an error
    (speechService['speakWithAzure'] as jest.Mock).mockRejectedValueOnce(new Error('Synthesis failed'));

    // Set useBrowserFallback to false to prevent fallback
    Object.defineProperty(speechService, 'speakWithBrowser', { 
      value: jest.fn().mockRejectedValue(new Error('Browser synthesis failed too'))
    });
    
    // Should reject with the error
    await expect(speechService.speak('apple', 'en-US')).rejects.toThrow();
  });
  
  test('uses browser fallback if Azure fails', async () => {
    // Mock Azure to fail but browser to succeed
    (speechService['speakWithAzure'] as jest.Mock).mockRejectedValueOnce(new Error('Azure failed'));
    
    // Should not throw when browser fallback works
    await expect(speechService.speak('apple', 'en-US')).resolves.not.toThrow();
    
    // Should have tried browser fallback
    expect(speechService['speakWithBrowser']).toHaveBeenCalledWith('apple', 'en-US', 1.0);
  });
});
