// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_initial_workout_schema.sql';
import m0001 from './0001_gym_schema_migration.sql';
import m0002 from './0002_gym_plan_rpe_section_snapshots.sql';
import m0003 from './0003_gym_session_source_name.sql';

export default {
    journal,
    migrations: {
        m0000,
        m0001,
        m0002,
        m0003,
    },
};
