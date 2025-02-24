import { Analytics } from './analytics';

declare global {
    interface Window {
        gtag: (...args: any[]) => void;
        clarity: {
            (command: 'consent' | 'log' | 'identify', ...args: any[]): void;
        };
    }
}

describe('Analytics', () => {
    const originalGtag = window.gtag;
    const originalClarity = window.clarity;

    beforeEach(() => {
        window.gtag = jest.fn();
        window.clarity = jest.fn();
    });

    afterEach(() => {
        window.gtag = originalGtag || jest.fn();
        window.clarity = originalClarity;
    });

    describe('trackGameStart', () => {
        it('tracks game start with full parameters', () => {
            const params = {
                wordCount: 10,
                difficulty: 'medium',
                inputMode: 'manual' as const,
                language: 'en'
            };
            Analytics.trackGameStart(params);
            
            expect(window.gtag).toHaveBeenCalledWith('event', 'game_start', {
                word_count: 10,
                difficulty: 'medium',
                input_mode: 'manual',
                language: 'en'
            });
            
            expect(window.clarity).toHaveBeenCalledWith('log', 'game_start', params);
        });
    });

    describe('trackGameComplete', () => {
        it('tracks game completion with full stats', () => {
            const stats = {
                totalWords: 10,
                perfectWords: 8,
                language: 'en',
                difficulty: 'medium',
                wrongAttempts: 2,
                accuracy: 80,
                inputMode: 'manual' as const
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
            
            expect(window.clarity).toHaveBeenCalledWith('log', 'game_complete', stats);
        });
    });

    describe('Clarity-specific methods', () => {
        it('configures Clarity consent', () => {
            Analytics.configureClarityConsent(true);
            expect(window.clarity).toHaveBeenCalledWith('consent', 'granted');

            Analytics.configureClarityConsent(false);
            expect(window.clarity).toHaveBeenCalledWith('consent', 'denied');
        });

        it('logs Clarity events', () => {
            const properties = { test: 'value' };
            Analytics.logClarityEvent('test_event', properties);
            expect(window.clarity).toHaveBeenCalledWith('log', 'test_event', properties);
        });

        it('identifies user', () => {
            const userId = 'user123';
            const properties = { test: 'value' };
            Analytics.identifyUser(userId, properties);
            expect(window.clarity).toHaveBeenCalledWith('identify', userId, properties);
        });
    });
});
