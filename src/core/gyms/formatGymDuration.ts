export const formatCompletedGymDuration = (
    startedAtMs: number,
    endedAtMs?: number,
): string => {
    if (endedAtMs === undefined) return '0 min';

    const totalSec = Math.max(0, Math.round((endedAtMs - startedAtMs) / 1000));
    const totalMin = Math.round(totalSec / 60);

    if (totalSec > 0 && totalMin < 1) {
        return '1 min';
    }

    if (totalMin < 60) {
        return `${totalMin} min`;
    }

    const hours = Math.floor(totalMin / 60);
    const minutes = totalMin % 60;

    if (minutes === 0) {
        return `${hours} h`;
    }

    return `${hours} h ${minutes} min`;
};
