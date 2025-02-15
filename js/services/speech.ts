// Assume microsoft-cognitiveservices-speech-sdk is loaded globally
declare const sdk: any;

interface TTSCache {
    text: string;
    language: string;
    rate: number;
    timestamp: string;
    audioBase64?: string;
}

const TTS_CACHE_PREFIX = 'tts_cache_';
const MAX_CACHE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const CACHE_CLEANUP_THRESHOLD = 0.9; // Start cleanup when cache reaches 90% of max size

function getTotalCacheSize(): number {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(TTS_CACHE_PREFIX)) {
            const item = localStorage.getItem(key);
            totalSize += item ? new Blob([item]).size : 0;
        }
    }
    return totalSize;
}

function cleanupTTSCache(): void {
    // Collect all TTS cache items
    const cacheItems: { key: string, item: TTSCache, size: number }[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(TTS_CACHE_PREFIX)) {
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
        if (currentSize > MAX_CACHE_SIZE_BYTES * CACHE_CLEANUP_THRESHOLD) {
            localStorage.removeItem(cacheItem.key);
            currentSize -= cacheItem.size;
            console.log(`🗑️ Removed oldest TTS cache: "${cacheItem.item.text}" (${new Date(cacheItem.item.timestamp).toISOString()})`);
        } else {
            break;
        }
    }
}

function initializeTTSCacheCleanup(): void {
    // Run initial cleanup when the script loads
    cleanupTTSCache();

    // Optional: Set up periodic cleanup (e.g., every hour)
    setInterval(cleanupTTSCache, 60 * 60 * 1000);
}

function getCachedTTS(text: string, language: string, rate: number): TTSCache | null {
    try {
        const cacheKey = `${TTS_CACHE_PREFIX}${text}_${language}_${rate}`;
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

function cacheTTS(text: string, language: string, rate: number, audioBlob: Blob): void {
    try {
        const cacheKey = `${TTS_CACHE_PREFIX}${text}_${language}_${rate}`;

        // Check current cache size before adding new item
        const currentSize = getTotalCacheSize();
        if (currentSize + audioBlob.size > MAX_CACHE_SIZE_BYTES) {
            cleanupTTSCache();
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

// Initialize cache cleanup when the script loads
initializeTTSCacheCleanup();

export async function speak(text: string, language: string = 'en-US', rate: number | string = 1.0): Promise<void> {
    // Hardcode Azure credentials for now
    const speechKey = 'GB2g3MWOD7LM7T2aVds9uQ6Ip3M6h8L4olb83XwzJZeexATsbEsTJQQJ99BAAC5RqLJXJ3w3AAAYACOGavjw';
    const speechRegion = 'westeurope';

    if (!speechKey || !speechRegion) {
        throw new Error('Missing Azure Speech configuration');
    }

    // Validate rate
    const rateValue = typeof rate === 'number'
        ? (rate >= 0.5 && rate <= 2 ? rate : 1.0)
        : (rate === 'slow' ? 0.7 : rate === 'fast' ? 1.5 : 1.0);

    // Check cache first
    const cachedTTS = getCachedTTS(text, language, rateValue);
    if (cachedTTS?.audioBase64) {
        console.log('Playing cached TTS');
        const audio = new Audio(cachedTTS.audioBase64);
        return new Promise((resolve, reject) => {
            audio.onended = () => resolve();
            audio.onerror = reject;
            audio.play();
        });
    }

    // Define voice based on language
    const voiceMap: Record<string, string> = {
        'en-US': 'en-US-JennyNeural', // Default US English female voice
        'he-IL': 'he-IL-HilaNeural',  // Default Hebrew female voice
    };
    const voice = voiceMap[language] || 'en-US-JennyNeural';

    return new Promise((resolve, reject) => {
        try {
            console.log('Azure TTS Attempt:', { text, language, rate: rateValue, voice });

            // Check if SpeechSDK is available
            if (!(window as any).SpeechSDK) {
                console.error('Azure Speech SDK not loaded');
                throw new Error('Azure Speech SDK not loaded');
            }

            const speechConfig = (window as any).SpeechSDK.SpeechConfig.fromSubscription(speechKey, speechRegion);
            speechConfig.speechSynthesisLanguage = language;

            const synthesizer = new (window as any).SpeechSDK.SpeechSynthesizer(speechConfig);

            // Create SSML with custom rate and voice
            const ssml = `
                <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${language}">
                    <voice name="${voice}">
                        <prosody rate="${rateValue}">${text}</prosody>
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
                        cacheTTS(text, language, rateValue, audioBlob);
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
