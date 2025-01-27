// Analytics utility for tracking game events
declare global {
    interface Window {
        gtag: (...args: any[]) => void;
    }
}

export class Analytics {
    static trackEvent(eventName: string, params: Record<string, any> = {}) {
        if (typeof window.gtag !== 'undefined') {
            window.gtag('event', eventName, params);
        }
    }

    static trackGameStart(wordCount: number) {
        this.trackEvent('game_start', { word_count: wordCount });
    }

    static trackGameComplete(stats: { totalWords: number, perfectWords: number, accuracy: number }) {
        this.trackEvent('game_complete', {
            total_words: stats.totalWords,
            perfect_words: stats.perfectWords,
            accuracy: stats.accuracy
        });
    }

    static trackWordAttempt(word: string, attempt: string, isCorrect: boolean, attemptNumber: number) {
        this.trackEvent('word_attempt', {
            word,
            attempt,
            is_correct: isCorrect,
            attempt_number: attemptNumber
        });
    }

    static trackLanguageChange(newLanguage: string) {
        this.trackEvent('language_change', { language: newLanguage });
    }

    static trackPreviousSetLoad(setIndex: number) {
        this.trackEvent('previous_set_load', { set_index: setIndex });
    }
}
