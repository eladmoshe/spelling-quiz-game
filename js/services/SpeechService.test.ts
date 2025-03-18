import { SpeechService } from './SpeechService';

describe('SpeechService', () => {
  let speechService: SpeechService;
  
  // Mock the SpeechSDK
  const mockSpeechSdk = {
    SpeechConfig: {
      fromSubscription: jest.fn().mockReturnValue({
        speechSynthesisVoiceName: '',
        speechSynthesisOutputFormat: '',
        speechRecognitionLanguage: ''
      })
    },
    SpeechSynthesizer: jest.fn().mockImplementation(() => ({
      speakTextAsync: jest.fn().mockImplementation((text, onSuccess, onError) => {
        onSuccess({ text });
        return { text };
      }),
      close: jest.fn()
    })),
    ResultReason: {
      SynthesizingAudioCompleted: 'SynthesizingAudioCompleted'
    },
    AudioConfig: {
      fromDefaultSpeakerOutput: jest.fn().mockReturnValue({})
    }
  };
  
  beforeEach(() => {
    // Reset the singleton instance
    Object.defineProperty(SpeechService, 'instance', {
      value: undefined,
      writable: true
    });
    
    // Mock window.SpeechSDK
    global.window = Object.create(window);
    Object.defineProperty(window, 'SpeechSDK', {
      value: mockSpeechSdk
    });
    
    // Create a new instance for each test
    speechService = SpeechService.getInstance();
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
    const result = await speechService.speak('apple', 'en-US');
    
    // Check that speech synthesis was called with correct parameters
    expect(mockSpeechSdk.SpeechConfig.fromSubscription).toHaveBeenCalled();
    expect(mockSpeechSdk.SpeechSynthesizer).toHaveBeenCalled();
    expect(result).toEqual({ text: 'apple' });
  });
  
  test('speak with slow rate sets longer pauses', async () => {
    await speechService.speak('banana', 'en-US', 'slow');
    
    // Check that speech synthesis was called with correct parameters
    const synthesizer = mockSpeechSdk.SpeechSynthesizer.mock.instances[0];
    expect(synthesizer.speakTextAsync).toHaveBeenCalledWith(
      expect.stringContaining('banana'),
      expect.any(Function),
      expect.any(Function)
    );
    
    // Should include SSML with prosody rate
    const ssmlText = synthesizer.speakTextAsync.mock.calls[0][0];
    expect(ssmlText).toContain('<prosody rate="slow"');
  });
  
  test('canPlayWord respects cooldown period', () => {
    // Initially should be able to play
    expect(speechService.canPlayWord()).toBe(true);
    
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
    Object.defineProperty(speechService, 'cooldownPeriod', {
      value: 5000, // 5 seconds
      writable: true
    });
    
    // Mock Date.now to return a consistent value
    const originalDateNow = Date.now;
    Date.now = jest.fn().mockReturnValue(now + 2000); // 2 seconds later
    
    // Should have 3 seconds remaining
    expect(speechService.getCooldownTimeRemaining()).toBe(3000);
    
    // Restore Date.now
    Date.now = originalDateNow;
  });
  
  test('handles synthesis errors gracefully', async () => {
    // Mock a synthesis error
    const mockErrorSynthesizer = {
      speakTextAsync: jest.fn().mockImplementation((text, onSuccess, onError) => {
        onError(new Error('Synthesis failed'));
        return { text };
      }),
      close: jest.fn()
    };
    mockSpeechSdk.SpeechSynthesizer.mockImplementation(() => mockErrorSynthesizer);
    
    // Should reject with the error
    await expect(speechService.speak('apple', 'en-US')).rejects.toThrow('Synthesis failed');
  });
});
