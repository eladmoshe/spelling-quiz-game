// Assume microsoft-cognitiveservices-speech-sdk is loaded globally
declare const sdk: any;

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
        : (rate === 'slow' ? 0.5 : rate === 'fast' ? 1.5 : 1.0);

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
                (result: any) => {
                    console.log('Azure TTS Result:', result);
                    if (result.reason === (window as any).SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
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
