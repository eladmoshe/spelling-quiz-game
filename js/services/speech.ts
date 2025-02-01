// Assume microsoft-cognitiveservices-speech-sdk is loaded globally
declare const sdk: any;

export async function speak(text: string, language: string = 'en-US'): Promise<void> {
    // Hardcode Azure credentials for now
    const speechKey = 'GB2g3MWOD7LM7T2aVds9uQ6Ip3M6h8L4olb83XwzJZeexATsbEsTJQQJ99BAAC5RqLJXJ3w3AAAYACOGavjw';
    const speechRegion = 'westeurope';

    if (!speechKey || !speechRegion) {
        throw new Error('Missing Azure Speech configuration');
    }

    return new Promise((resolve, reject) => {
        try {
            const speechConfig = (window as any).SpeechSDK.SpeechConfig.fromSubscription(speechKey, speechRegion);
            speechConfig.speechSynthesisLanguage = language;

            const synthesizer = new (window as any).SpeechSDK.SpeechSynthesizer(speechConfig);

            synthesizer.speakTextAsync(
                text, 
                (result: any) => {
                    if (result.reason === (window as any).SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
                        resolve();
                    } else {
                        reject(new Error('Speech synthesis failed'));
                    }
                    synthesizer.close();
                }, 
                (error: any) => {
                    reject(error);
                }
            );
        } catch (error) {
            reject(error);
        }
    });
}
