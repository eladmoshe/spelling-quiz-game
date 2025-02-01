import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export async function speak(text: string, language: string = 'en-US'): Promise<void> {
    return new Promise((resolve, reject) => {
        const speechKey = process.env.AZURE_SPEECH_KEY;
        const speechRegion = process.env.AZURE_SPEECH_REGION;

        if (!speechKey || !speechRegion) {
            console.error('Missing Azure Speech configuration. Please set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in .env file.');
            reject(new Error('Missing Azure Speech configuration'));
            return;
        }

        const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
        speechConfig.speechSynthesisLanguage = language;

        const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

        synthesizer.speakText(text, (result) => {
            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                resolve();
            } else {
                reject(new Error('Speech synthesis failed'));
            }
            synthesizer.close();
        }, (error) => {
            console.error('Speech synthesis error:', error);
            reject(error);
        });
    });
}
