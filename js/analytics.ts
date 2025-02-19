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

    static trackGameStart(params: {
        wordCount: number, 
        difficulty: string, 
        inputMode: 'manual' | 'random', 
        language: string
    }) {
        this.trackEvent('game_start', {
            word_count: params.wordCount,
            difficulty: params.difficulty,
            input_mode: params.inputMode,
            language: params.language
        });
    }

    static trackGameComplete(stats: {
        totalWords: number, 
        perfectWords: number, 
        accuracy: number, 
        language: string,
        inputMode: 'manual' | 'random',
        difficulty: string,
        wrongAttempts: number
    }) {
        this.trackEvent('game_complete', {
            total_words: stats.totalWords,
            perfect_words: stats.perfectWords,
            accuracy: stats.accuracy,
            language: stats.language,
            input_mode: stats.inputMode,
            difficulty: stats.difficulty,
            wrong_attempts: stats.wrongAttempts
        });
    }

    static trackWordAttempt(params: {
        word: string, 
        attempt: string, 
        isCorrect: boolean, 
        attemptNumber: number,
        language: string
    }) {
        this.trackEvent('word_attempt', {
            word: params.word,
            attempt: params.attempt,
            is_correct: params.isCorrect,
            attempt_number: params.attemptNumber,
            language: params.language
        });
    }

    static trackLanguageChange(newLanguage: string) {
        this.trackEvent('language_change', { language: newLanguage });
    }

    static trackPreviousSetLoad(setIndex: number) {
        this.trackEvent('previous_set_load', { set_index: setIndex });
    }

    static trackInputModeChange(newMode: 'manual' | 'random') {
        this.trackEvent('input_mode_change', { input_mode: newMode });
    }

    static trackDifficultyChange(difficulty: string) {
        this.trackEvent('difficulty_change', { difficulty });
    }
}
