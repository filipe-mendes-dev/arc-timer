import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import type { GymPlan } from '@src/core/entities/gym.interfaces';
import { ARC_GYM_PLAN_MIME, type ExportedGymPlanFileV1 } from './exportTypes';

export type ExportGymPlanResult =
    | { ok: true }
    | {
          ok: false;
          error: 'SHARING_UNAVAILABLE' | 'WRITE_FAILED' | 'SHARE_FAILED';
      };

const sanitizeFilename = (name: string): string => {
    const safe = name
        .replace(/[^\w\s-]/g, '')
        .trim()
        .slice(0, 60);

    return safe.length > 0 ? safe : 'Gym Plan';
};

export const exportGymPlanToFile = async (
    gymPlan: GymPlan,
): Promise<ExportGymPlanResult> => {
    const payload: ExportedGymPlanFileV1 = {
        version: 1,
        kind: 'arc-timer/gym-plan',
        exportedAt: new Date().toISOString(),
        app: {
            name: 'ARC Timer',
            platform: 'mobile',
        },
        gymPlan,
    };

    const json = JSON.stringify(payload, null, 2);
    const safeName = sanitizeFilename(gymPlan.name);
    const filename = `${safeName}.arcgp`;
    const file = new File(Paths.cache, filename);

    try {
        file.write(json);
    } catch (error: unknown) {
        console.warn('Gym plan export write failed', error);
        return { ok: false, error: 'WRITE_FAILED' };
    }

    let canShare = false;
    try {
        canShare = await Sharing.isAvailableAsync();
    } catch (error: unknown) {
        console.warn('Gym plan sharing availability check failed', error);
        return { ok: false, error: 'SHARING_UNAVAILABLE' };
    }

    if (!canShare) {
        return { ok: false, error: 'SHARING_UNAVAILABLE' };
    }

    try {
        await Sharing.shareAsync(file.uri, {
            mimeType: ARC_GYM_PLAN_MIME,
            dialogTitle: `Share gym plan "${gymPlan.name}"`,
        });

        return { ok: true };
    } catch (error: unknown) {
        console.warn('Gym plan share failed', error);
        return { ok: false, error: 'SHARE_FAILED' };
    }
};
