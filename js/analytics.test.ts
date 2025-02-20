import { Analytics } from './analytics';

declare global {
    interface Window {
        gtag: (...args: any[]) => void;
    }
}

describe('Analytics', () => {
    const originalGtag = window.gtag;

    beforeEach(() => {
        window.gtag = jest.fn();
    });

    afterEach(() => {
        window.gtag = originalGtag || jest.fn();
    });

    describe('trackEvent', () => {
        it('tracks events with parameters', () => {
            Analytics.trackEvent('test_event', { param1: 'value1' });
            expect(window.gtag).toHaveBeenCalledWith('event', 'test_event', { param1: 'value1' });
        });

        it('handles empty params', () => {
            Analytics.trackEvent('test_event');
            expect(window.gtag).toHaveBeenCalledWith('event', 'test_event', {});
        });
    });

    describe('trackGameStart', () => {
        it('tracks game start with full parameters', () => {
            Analytics.trackGameStart({
                wordCount: 10,
                difficulty: 'medium',
                inputMode: 'manual',
                language: 'en'
            });
            expect(window.gtag).toHaveBeenCalledWith('event', 'game_start', {
                word_count: 10,
                difficulty: 'medium',
                input_mode: 'manual',
                language: 'en'
            });
        });
    });

    describe('trackGameComplete', () => {
        it('tracks game completion with full stats', () => {
            const stats = {
                totalWords: 10,
                perfectWords: 8,
                accuracy: 80,
                language: 'en',
                inputMode: 'manual' as const,
                difficulty: 'medium',
                wrongAttempts: 2
            };
            Analytics.trackGameComplete(stats);
            expect(window.gtag).toHaveBeenCalledWith('event', 'game_complete', {
                total_words: 10,
                perfect_words: 8,
                accuracy: 80,
                language: 'en',
                input_mode: 'manual',
                difficulty: 'medium',
                wrong_attempts: 2
            });
        });
    });

    describe('trackWordAttempt', () => {
        it('tracks word attempt with all parameters', () => {
            Analytics.trackWordAttempt({
                word: 'hello',
                attempt: 'helo',
                isCorrect: false,
                attemptNumber: 1,
                language: 'en'
            });
            expect(window.gtag).toHaveBeenCalledWith('event', 'word_attempt', {
                word: 'hello',
                attempt: 'helo',
                is_correct: false,
                attempt_number: 1,
                language: 'en'
            });
        });

        it('tracks successful word attempt', () => {
            Analytics.trackWordAttempt({
                word: 'world',
                attempt: 'world',
                isCorrect: true,
                attemptNumber: 1,
                language: 'en'
            });
            expect(window.gtag).toHaveBeenCalledWith('event', 'word_attempt', {
                word: 'world',
                attempt: 'world',
                is_correct: true,
                attempt_number: 1,
                language: 'en'
            });
        });
    });

    describe('trackLanguageChange', () => {
        it('tracks language change', () => {
            Analytics.trackLanguageChange('he');
            expect(window.gtag).toHaveBeenCalledWith('event', 'language_change', {
                language: 'he'
            });
        });
    });

    describe('trackPreviousSetLoad', () => {
        it('tracks previous set load', () => {
            Analytics.trackPreviousSetLoad(2);
            expect(window.gtag).toHaveBeenCalledWith('event', 'previous_set_load', {
                set_index: 2
            });
        });
    });
});
