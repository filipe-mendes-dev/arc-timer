export const gramsToKg = (weightGrams: number): string => {
    const weightKg = weightGrams / 1000;
    return Number.isInteger(weightKg) ? `${weightKg}` : weightKg.toFixed(1);
};

export const getWeightGrams = (weightKg: number): number | undefined => {
    if (weightKg <= 0) return undefined;

    return Math.round(weightKg * 1000);
};

export const formatWeight = (grams?: number): string | undefined => {
    if (grams === undefined) return undefined;

    return `${grams / 1000} kg`;
};

export const formatDistance = (distanceMeters: number): string => {
    const distanceKm = distanceMeters / 1000;

    if (Number.isInteger(distanceKm)) {
        return `${distanceKm}`;
    }

    return distanceKm.toFixed(2);
};

export const formatDurationMinutes = (durationSec: number): string => {
    const durationMin = Math.round(durationSec / 60);

    if (durationSec > 0 && durationMin < 1) {
        return '1 min';
    }

    if (durationMin < 60) {
        return `${durationMin} min`;
    }

    const hours = Math.floor(durationMin / 60);
    const minutes = durationMin % 60;

    if (minutes === 0) {
        return `${hours} h`;
    }

    return `${hours} h ${minutes} min`;
};
