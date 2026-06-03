export type RoundingMode = 'ceil' | 'floor';

export const msToSeconds = (
    ms: number,
    mode: 'floor' | 'ceil' | 'round' = 'round'
): number => {
    if (ms <= 0) return 0;

    switch (mode) {
        case 'floor':
            return Math.floor(ms / 1000);
        case 'ceil':
            return Math.ceil(ms / 1000);
        case 'round':
        default:
            return Math.round(ms / 1000);
    }
};

export const formatShortTime = (timestampMs: number, locale?: string): string =>
    new Date(timestampMs).toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
    });

export const formatElapsedDuration = (durationMs: number): string => {
    const totalSeconds = msToSeconds(durationMs, 'floor');
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0'),
    ].join(':');
};
