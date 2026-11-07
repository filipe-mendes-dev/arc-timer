import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';

describe('exercise tracking fields migration', () => {
    let sqliteDb: Database.Database;

    beforeEach(() => {
        sqliteDb = new Database(':memory:');
        sqliteDb.exec(`
            CREATE TABLE exercise_definitions (
                id TEXT PRIMARY KEY NOT NULL
            );
            CREATE TABLE exercise_definition_default_tracking_fields (
                exercise_definition_id TEXT PRIMARY KEY NOT NULL,
                reps INTEGER,
                weight_grams INTEGER,
                duration_sec INTEGER,
                distance_meters INTEGER,
                rpe_tenths INTEGER,
                created_at_ms INTEGER NOT NULL,
                updated_at_ms INTEGER NOT NULL,
                FOREIGN KEY (exercise_definition_id)
                    REFERENCES exercise_definitions(id)
                    ON DELETE CASCADE
            );
            INSERT INTO exercise_definitions (id) VALUES ('cardio');
            INSERT INTO exercise_definition_default_tracking_fields (
                exercise_definition_id,
                reps,
                weight_grams,
                duration_sec,
                distance_meters,
                rpe_tenths,
                created_at_ms,
                updated_at_ms
            ) VALUES ('cardio', NULL, NULL, 300, 1000, NULL, 1, 1);
        `);
    });

    afterEach(() => {
        sqliteDb.close();
    });

    it('backfills field selection from existing numeric defaults', () => {
        const migrationSql = readFileSync(
            'drizzle/0004_exercise-tracking-field-selection.sql',
            'utf8',
        ).replaceAll('--> statement-breakpoint', '');

        sqliteDb.exec(migrationSql);

        const row = sqliteDb
            .prepare(
                `SELECT
                    has_reps AS hasReps,
                    has_weight AS hasWeight,
                    has_duration AS hasDuration,
                    has_distance AS hasDistance,
                    has_rpe AS hasRpe
                FROM exercise_definition_default_tracking_fields
                WHERE exercise_definition_id = 'cardio'`,
            )
            .get();

        expect(row).toEqual({
            hasReps: 0,
            hasWeight: 0,
            hasDuration: 1,
            hasDistance: 1,
            hasRpe: 0,
        });
    });
});
