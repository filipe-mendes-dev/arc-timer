import { appVariant } from '@src/config/appVariant';
import { db } from './client';
import { createDbServices } from './createDbServices';

export const dbServices = createDbServices({
    db,
    isDevelopment: appVariant === 'development',
});
