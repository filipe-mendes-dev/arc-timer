import { migrate } from 'drizzle-orm/expo-sqlite/migrator';

import migrations from '../../drizzle/migrations';
import { isScreenshotVariant } from '@src/config/appVariant';

import { db } from './client';
import { dbServices } from './dbServices';
import { migrateAsyncStorageWorkoutData } from './migrations/migrateAsyncStorageWorkoutData/migrateAsyncStorageWorkoutData';
import { seedScreenshotDemoData } from './migrations/seedScreenshotDemoData';
import { seedSystemExerciseDefinitionsOnce } from './migrations/seedSystemExerciseDefinitions';

let databaseInitializationPromise: Promise<void> | null = null;

export const initializeDatabase = async (): Promise<void> => {
    databaseInitializationPromise ??= (async () => {
        await migrate(db, migrations);
        await seedSystemExerciseDefinitionsOnce(
            dbServices.exerciseDefinitionService
        );
        await migrateAsyncStorageWorkoutData();
        if (isScreenshotVariant) {
            await seedScreenshotDemoData(db);
        }
    })().catch((error) => {
        databaseInitializationPromise = null;
        throw error;
    });

    return databaseInitializationPromise;
};
