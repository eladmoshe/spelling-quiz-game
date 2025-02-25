// Assume microsoft-cognitiveservices-speech-sdk is loaded globally
declare const sdk: any;

export type SpeechRate = number | 'slow' | 'normal' | 'fast';

interface TTSCache {
  text: string;
  language: string;
  rate: number;
  timestamp: string;
  audioBase64?: string;
}

export class SpeechService {
  private static instance: SpeechService;
  private readonly TTS_CACHE_PREFIX = 'tts_cache_';
  private readonly MAX_CACHE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
  private readonly CACHE_CLEANUP_THRESHOLD = 0.9; // Start cleanup when cache reaches 90% of max size
  private readonly PLAY_COOLDOWN_MS = 1000; // 1 second cooldown between plays
  private lastPlayTime = 0;

  private constructor() {
    this.initializeTTSCacheCleanup();
  }

  public static getInstance(): SpeechService {
    if (!SpeechService.instance) {
      SpeechService.instance = new SpeechService();
    }
    return SpeechService.instance;
  }

  /**
   * Speaks the provided text using Azure TTS or browser fallback
   * @param text The text to speak
   * @param language The language code (e.g., 'en-US', 'he-IL')
   * @param rate Speech rate (number between 0.5-2.0, or 'slow'/'normal'/'fast')
   * @returns Promise that resolves when speech is complete
   */
  public async speak(text: string, language: string = 'en-US', rate: SpeechRate = 1.0): Promise<void> {
    // Check if enough time has passed since last play
    if (!this.canPlayWord()) {
      return Promise.reject(new Error('Please wait before playing again'));
    }
    
    // Update last play time
    this.lastPlayTime = Date.now();
    
    // Convert rate string to number
    const rateValue = this.normalizeRate(rate);
    
    // Check cache first
    const cachedTTS = this.getCachedTTS(text, language, rateValue);
    if (cachedTTS?.audioBase64) {
      console.log('Playing cached TTS');
      return this.playAudio(cachedTTS.audioBase64);
    }

    // Try Azure TTS
    try {
      console.log('Attempting Azure TTS for word:', text);
      return await this.speakWithAzure(text, language, rateValue);
    } catch (error) {
      console.error('Azure TTS failed:', error);
      
      // Fallback to browser speech synthesis
      return this.speakWithBrowser(text, language, rateValue);
    }
  }

  /**
   * Checks if enough time has passed since the last play
   */
  public canPlayWord(): boolean {
    const now = Date.now();
    const timeSinceLastPlay = now - this.lastPlayTime;
    return timeSinceLastPlay >= this.PLAY_COOLDOWN_MS;
  }

  /**
   * Get time remaining before next play is allowed
   */
  public getCooldownTimeRemaining(): number {
    const now = Date.now();
    const timeSinceLastPlay = now - this.lastPlayTime;
    return Math.max(0, this.PLAY_COOLDOWN_MS - timeSinceLastPlay);
  }
  
  // Private methods
  
  private initializeTTSCacheCleanup(): void {
    // Run initial cleanup when the service initializes
    this.cleanupTTSCache();
    
    // Optional: Set up periodic cleanup (e.g., every hour)
    setInterval(() => this.cleanupTTSCache(), 60 * 60 * 1000);
  }
  
  private normalizeRate(rate: SpeechRate): number {
    if (typeof rate === 'number') {
      // Ensure rate is within valid range
      return Math.max(0.5, Math.min(2, rate));
    } else {
      // Convert string rates to numbers
      switch (rate) {
        case 'slow': return 0.7;
        case 'fast': return 1.5;
        default: return 1.0; // normal rate
      }
    }
  }
  
  private async speakWithAzure(text: string, language: string, rate: number): Promise<void> {
    // Hardcode Azure credentials for now
    // This is a simulated key that doesn't work - in a real implementation, you'd get this from environment or config
    const speechKey = 'GB2g3MWOD7LM7T2aVds9uQ6Ip3M6h8L4olb83XwzJZeexATsbEsTJQQJ99BAAC5RqLJXJ3w3AAAYACOGavjw';
    const speechRegion = 'westeurope';

    if (!speechKey || !speechRegion) {
      throw new Error('Missing Azure Speech configuration');
    }

    // Check if SpeechSDK is available
    if (!(window as any).SpeechSDK) {
      throw new Error('Azure Speech SDK not loaded');
    }

    // Define voice based on language
    const voiceMap: Record<string, string> = {
      'en-US': 'en-US-JennyNeural', // Default US English female voice
      'he-IL': 'he-IL-HilaNeural',  // Default Hebrew female voice
    };
    const voice = voiceMap[language] || 'en-US-JennyNeural';

    return new Promise((resolve, reject) => {
      try {
        console.log('Azure TTS Attempt:', { text, language, rate, voice });
  
        const speechConfig = (window as any).SpeechSDK.SpeechConfig.fromSubscription(speechKey, speechRegion);
        speechConfig.speechSynthesisLanguage = language;
  
        const synthesizer = new (window as any).SpeechSDK.SpeechSynthesizer(speechConfig);
  
        // Create SSML with custom rate and voice
        const ssml = `
          <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${language}">
            <voice name="${voice}">
              <prosody rate="${rate}">${text}</prosody>
            </voice>
          </speak>
        `.trim();
  
        console.log('Generated SSML:', ssml);
  
        synthesizer.speakSsmlAsync(
          ssml,
          async (result: any) => {
            console.log('Azure TTS Result:', result);
            if (result.reason === (window as any).SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
              // Convert audio to blob and cache
              const audioBlob = new Blob([result.audioData], { type: 'audio/wav' });
              this.cacheTTS(text, language, rate, audioBlob);
              resolve();
            } else {
              console.error('Azure TTS Synthesis Failed:', result);
              reject(new Error('Speech synthesis failed: ' + JSON.stringify(result)));
            }
            synthesizer.close();
          },
          (error: any) => {
            console.error('Azure TTS Error:', error);
            reject(error);
          }
        );
      } catch (error) {
        console.error('Azure TTS Catch Error:', error);
        reject(error);
      }
    });
  }
  
  private speakWithBrowser(text: string, language: string, rate: number): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('Using browser speech synthesis fallback');
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = rate;
        
        utterance.onend = () => resolve();
        utterance.onerror = (event) => reject(new Error(`Browser speech synthesis error: ${event.error}`));
        
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Browser speech synthesis failed:', error);
        reject(error);
      }
    });
  }
  
  private playAudio(audioBase64: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioBase64);
      audio.onended = () => resolve();
      audio.onerror = (error) => reject(error);
      audio.play().catch(reject);
    });
  }
  
  // Cache management
  
  private getTotalCacheSize(): number {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.TTS_CACHE_PREFIX)) {
        const item = localStorage.getItem(key);
        totalSize += item ? new Blob([item]).size : 0;
      }
    }
    return totalSize;
  }
  
  private cleanupTTSCache(): void {
    // Collect all TTS cache items
    const cacheItems: { key: string, item: TTSCache, size: number }[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.TTS_CACHE_PREFIX)) {
        const itemStr = localStorage.getItem(key);
        if (itemStr) {
          try {
            const item: TTSCache = JSON.parse(itemStr);
            const size = new Blob([itemStr]).size;
            cacheItems.push({ key, item, size });
          } catch (error) {
            console.error('Error parsing cache item:', error);
          }
        }
      }
    }

    // Sort by timestamp (oldest first)
    cacheItems.sort((a, b) => new Date(a.item.timestamp).getTime() - new Date(b.item.timestamp).getTime());

    // Remove items until cache is under the size threshold
    let currentSize = cacheItems.reduce((sum, item) => sum + item.size, 0);

    for (const cacheItem of cacheItems) {
      if (currentSize > this.MAX_CACHE_SIZE_BYTES * this.CACHE_CLEANUP_THRESHOLD) {
        localStorage.removeItem(cacheItem.key);
        currentSize -= cacheItem.size;
        console.log(`🗑️ Removed oldest TTS cache: "${cacheItem.item.text}" (${new Date(cacheItem.item.timestamp).toISOString()})`);
      } else {
        break;
      }
    }
  }
  
  private getCachedTTS(text: string, language: string, rate: number): TTSCache | null {
    try {
      const cacheKey = `${this.TTS_CACHE_PREFIX}${text}_${language}_${rate}`;
      const cachedItem = localStorage.getItem(cacheKey);

      if (cachedItem) {
        console.log(`🟢 TTS Cache HIT for: "${text}" (lang: ${language}, rate: ${rate})`);
        return JSON.parse(cachedItem);
      } else {
        console.log(`🔴 TTS Cache MISS for: "${text}" (lang: ${language}, rate: ${rate})`);
        return null;
      }
    } catch (error) {
      console.error('Error checking TTS cache:', error);
      return null;
    }
  }
  
  private cacheTTS(text: string, language: string, rate: number, audioBlob: Blob): void {
    try {
      const cacheKey = `${this.TTS_CACHE_PREFIX}${text}_${language}_${rate}`;

      // Check current cache size before adding new item
      const currentSize = this.getTotalCacheSize();
      if (currentSize + audioBlob.size > this.MAX_CACHE_SIZE_BYTES) {
        this.cleanupTTSCache();
      }

      // Convert blob to base64 for storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        const cacheItem: TTSCache = {
          text,
          language,
          rate,
          timestamp: new Date().toISOString(),
          audioBase64: base64data
        };

        localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
        console.log(`💾 TTS Cache STORED: "${text}" (lang: ${language}, rate: ${rate})`);
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Error caching TTS:', error);
    }
  }
}

export default SpeechService;