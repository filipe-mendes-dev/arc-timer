import { useEffect, useState } from 'react';

import { formatElapsedDuration } from '@src/helpers/time.helpers';

const TICK_INTERVAL_MS = 1000;

export const useElapsedDuration = (startedAtMs?: number): string => {
    const [nowMs, setNowMs] = useState(Date.now());

    useEffect(() => {
        const intervalId = setInterval(() => {
            setNowMs(Date.now());
        }, TICK_INTERVAL_MS);

        return () => clearInterval(intervalId);
    }, []);

    if (startedAtMs === undefined) {
        return formatElapsedDuration(0);
    }

    return formatElapsedDuration(nowMs - startedAtMs);
};
