import type { I18nResource } from './interfaces';

export const en: I18nResource = {
    common: {
        actions: {
            back: 'Back',
            cancel: 'Cancel',
            remove: 'Remove',
            edit: 'Edit',
            save: 'Save',
            start: 'Start',
            share: 'Share',
            done: 'Done',
        },
        status: {
            noTimeEstimate: 'No time estimate',
            mixedTimeAndReps: 'Mixed (time + reps)',
        },
        units: {
            block_one: '{{count}} block',
            block_other: '{{count}} blocks',
            set_one: '{{count}} set',
            set_other: '{{count}} sets',
            exercise_one: '{{count}} exercise',
            exercise_other: '{{count}} exercises',
        },
        labels: {
            blockWithIndex: 'Block {{index}}',
            exerciseWithIndex: 'Exercise {{index}}',
        },
        selectMode: {
            enter: 'Select',
            countSelected_zero: 'Select items',
            countSelected_one: '{{count}} selected',
            countSelected_other: '{{count}} selected',
            selectAll: 'Select all',
            deleteSelected_one: 'Delete {{count}} item',
            deleteSelected_other: 'Delete {{count}} items',
        },
    },
    drawer: {
        home: 'Home',
        workouts: 'Workouts',
        gym: 'Gym',
        exercises: 'Exercises',
        history: 'History',
        settings: 'Settings',
        quickAccess: 'Quick access',
    },
    bootstrap: {
        databaseError: {
            title: 'Something went wrong',
            description:
                'Arc Timer could not get your data ready. Restart your app or try again.',
            retry: 'Try again',
        },
    },
    home: {
        title: 'Home',
        welcome: 'Welcome',
        subtitle: 'Get started with your training.',
        quickWorkout: 'Quick Workout',
        startImmediately: 'Start immediately',
        recentWorkouts: 'Recent Workouts',
        noSessionsYet: 'No sessions yet.',
    },
    gym: {
        title: 'Gym',
        heading: 'Gym session',
        subtitle: 'Track strength work outside timed workouts.',
        currentSession: 'Current session',
        sessionStats: 'Session stats',
        actions: {
            startNewSession: 'Quick session',
            startNewSessionSubtitle: 'Start from an empty gym log',
            resumeSession: 'Resume session',
            finishSession: 'Finish session',
            history: 'Session history',
            historySubtitle: 'Review completed gym sessions',
            plans: 'Gym plans',
            plansSubtitle: 'Build reusable strength templates',
            sessionInProgress: 'Session in progress',
            sessionInProgressSubtitle: 'Finish it before starting another',
        },
        finishSessionModal: {
            title: 'Finish session?',
            message:
                'Complete this session to save it to history, or discard it without keeping progress.',
            complete: 'Complete',
            discard: 'Discard',
        },
        status: {
            active: 'An active gym session is already running.',
            none: 'No active gym session.',
        },
        errors: {
            activeSessionExists: 'An active gym session already exists.',
            activeSessionCannotBeDeleted:
                'Active gym sessions must be finished or discarded.',
            activeSessionNotFound: 'Active gym session was not found.',
            exerciseDefinitionNotFound: 'Exercise was not found.',
            exerciseDefinitionNotGymAvailable:
                'This exercise cannot be used in gym sessions.',
            exerciseRecordNotFound: 'Exercise record was not found.',
            exerciseRecordNotInActiveSession:
                'Exercise record is not in the active session.',
            exerciseNameRequired: 'Exercise name is required.',
            exerciseSetNotFound: 'Exercise set was not found.',
            gymPlanArchived: 'Archived plans cannot start a session.',
            gymPlanNotFound: 'Gym plan was not found.',
            invalidGymExerciseRecordTimeRange:
                'Exercise record cannot end before it starts.',
            invalidGymPlan: 'Gym plan is invalid.',
            invalidGymSessionTimeRange:
                'Gym session cannot end before it starts.',
            invalidGymSet:
                'Gym set must include reps, weight, duration, or distance.',
            sessionNotFound: 'Gym session was not found.',
            sessionNotMutable: 'Gym session is not active.',
            startFailed: 'Could not start a gym session. Try again.',
        },
    },
    gymPlans: {
        title: 'Gym Plans',
        searchPlaceholder: 'Search gym plans',
        emptyTitle: 'No Gym Plans Yet',
        emptyDescription: 'Create a reusable plan for your gym sessions.',
        searchEmptyTitle: 'No Plans Found',
        searchEmptyDescription: 'Try a different plan name.',
        actions: {
            createPlan: '+ Create Plan',
            new: '+ New',
        },
        modal: {
            title: 'New Gym Plan',
            subtitle: 'Choose how you want to start:',
            createNew: 'Create New',
            importFromFile: 'Import From File',
            resumeDraft: 'Resume Draft',
            cancel: 'Cancel',
        },
        import: {
            errors: {
                invalidExtension:
                    'That file is not an ARC Timer gym plan (.arcgymplan).',
                invalidKind:
                    'That file is not an ARC Timer gym plan export.',
                invalidShape:
                    'That file looks like an ARC Timer export, but it is missing data.',
                parseFailed: 'The file is corrupted or not valid JSON.',
                readFailed: 'Could not read the selected file.',
                unexpected: 'Import failed due to an unexpected error.',
            },
        },
        confirmRemove: {
            title: 'Delete Gym Plan?',
            message: 'This gym plan will be permanently deleted.',
            confirm: 'Delete',
        },
        confirmRemoveBulk: {
            title_one: 'Delete {{count}} Gym Plan?',
            title_other: 'Delete {{count}} Gym Plans?',
            message_one: 'This selected gym plan will be permanently deleted.',
            message_other:
                'The {{count}} selected gym plans will be permanently deleted.',
        },
        card: {
            label: 'Plan',
            sections_one: '{{count}} section',
            sections_other: '{{count}} sections',
            exercises_one: '{{count}} exercise',
            exercises_other: '{{count}} exercises',
        },
    },
    gymPlanDetails: {
        title: 'Gym plan',
        notFound: 'Gym plan not found',
        overview: 'Overview',
        cardTitle: 'Plan overview',
        sections: 'Sections',
        sectionFallback: 'Section {{index}}',
        exerciseCount_one: '{{count}} exercise',
        exerciseCount_other: '{{count}} exercises',
        exerciseFallback: 'Exercise',
        noTargets: 'No targets',
        favorite: 'Favorite',
        hint: 'You can run this gym plan now or edit it before your next session.',
        exportGymPlan: 'Share gym plan',
        metrics: {
            sections: 'Sections',
            exercises: 'Exercises',
            targetSets: 'Target sets',
        },
        actions: {
            start: 'Start plan',
            edit: 'Edit',
            favorite: 'Favorite',
            unfavorite: 'Unfavorite',
            archive: 'Archive',
            restore: 'Restore',
            delete: 'Delete',
        },
        targets: {
            sets_one: '{{count}} set',
            sets_other: '{{count}} sets',
            reps_one: '{{count}} rep',
            reps_other: '{{count}} reps',
            weightKg: '{{value}} kg',
            durationSec: '{{value}} sec',
        },
        deleteConfirm: {
            title: 'Delete gym plan?',
            message: 'This gym plan will be permanently deleted.',
            confirm: 'Delete',
        },
        export: {
            sharingUnavailable: 'Sharing is not available on this device.',
            writeFailed: 'Could not prepare this gym plan for sharing.',
            failed: 'Could not share this gym plan. Try again.',
        },
        errors: {
            actionFailed: 'Could not complete this action. Try again.',
        },
    },
    gymPlanBuilder: {
        title: 'New Plan',
        draftMissing: 'No draft plan found.',
        sectionFallback: 'Section {{index}}',
        exerciseFallback: 'Exercise',
        exerciseCount_one: '{{count}} exercise',
        exerciseCount_other: '{{count}} exercises',
        plannedSetCount_one: '{{count}} planned set',
        plannedSetCount_other: '{{count}} planned sets',
        noTargets: 'No targets',
        sections: {
            details: 'Details',
            plan: 'Gym plan',
        },
        hints: {
            tapSectionToEdit: 'Tap a section to edit its details.',
        },
        fields: {
            name: 'Plan name',
            namePlaceholder: 'e.g., Push day',
            description: 'Description',
            descriptionPlaceholder: 'Optional notes for this plan',
            sectionTitle: 'Section title',
            targetWeightKg: 'Weight kg',
            notes: 'Notes',
        },
        actions: {
            addSection: 'Add section',
            addExercise: 'Add exercise',
            addNote: 'Add note',
            removeNote: 'Remove note',
            removeSection: 'Remove section',
            save: 'Save',
            saveSection: 'Save',
        },
        exercisePicker: {
            title: 'Add exercise',
            searchPlaceholder: 'Search gym exercises',
        },
        exerciseCard: {
            label: 'Planned exercise',
        },
        targetFields: {
            description:
                'Choose which targets appear on each planned exercise. Reps and weight are enabled by default.',
            removeDataAndSave: 'Remove targets and save',
            removeDataWarning:
                'Saving will remove existing targets for: {{fields}}.',
            title: 'Tracking fields',
        },
        sectionEditor: {
            exercises: 'Exercise List',
            notFound: 'Plan section not found.',
            tapExerciseToEdit: 'Tap an exercise to edit.',
            title: 'Section details',
        },
        targets: {
            sets_one: '{{count}} set',
            sets_other: '{{count}} sets',
            reps_one: '{{count}} rep',
            reps_other: '{{count}} reps',
            weightKg: '{{value}} kg',
        },
        validation: {
            nameRequired: 'Plan name is required.',
            sectionRequired: 'Add at least one section.',
            sectionExerciseRequired:
                'Section {{index}} needs at least one exercise.',
            placeholderExerciseRequired:
                'Choose an exercise for every item in section {{index}}.',
            saveFailed: 'Could not save this draft. Try again.',
        },
        discardConfirm: {
            title: 'Discard draft?',
            message: 'This draft plan will be deleted.',
            confirm: 'Discard',
        },
        removeSectionConfirm: {
            title: 'Remove section?',
            message: 'This section and its exercises will be removed.',
        },
        removeExerciseConfirm: {
            title: 'Remove exercise?',
            message: 'This exercise will be removed from the plan.',
        },
    },
    gymPlanExerciseEdit: {
        title: 'Planned exercise',
        notFound: 'Planned exercise not found.',
        exerciseName: 'Exercise name',
        exerciseNamePlaceholder: 'e.g., Leg Press',
        newExerciseTitle: 'New Exercise',
        exerciseFallback: 'Exercise',
        targets: 'Set targets',
        notes: 'Notes',
        hint: 'Changes are saved to the draft plan automatically.',
        errors: {
            nameRequired: 'Exercise name is required.',
            saveFailed: 'Could not save this exercise. Try again.',
        },
    },
    gymActiveSession: {
        title: 'Gym session',
        duration: 'Duration',
        startedAt: 'Started',
        sets: 'Sets',
        exercises: 'Exercises',
        emptyTitle: 'No active gym session',
        emptyDescription: 'Start a gym session before tracking exercises.',
        noExercisesTitle: 'No exercises yet',
        noExercisesDescription:
            'Add exercises here as you move through the session.',
        status: {
            complete: 'Complete',
            inProgress: 'In progress',
            live: 'Live',
        },
        actions: {
            addExercise: 'Add exercise',
            backToGym: 'Back to Gym',
            discard: 'Discard',
            end: 'End',
            finish: 'Finish',
            removeExercise: 'Remove',
        },
        finishConfirm: {
            title: 'Finish session?',
            message: 'This will save the gym session to your history.',
        },
        discardConfirm: {
            title: 'Discard session?',
            message:
                'This gym session will be closed without keeping progress.',
        },
        removeExerciseConfirm: {
            title: 'Remove exercise?',
            message:
                'This exercise and all of its sets will be removed from the session.',
        },
        addExerciseModal: {
            create: 'Create',
            name: 'Name',
            namePlaceholder: 'e.g., Bench press',
            nameRequired: 'Exercise name is required.',
            subtitle: 'Use a saved exercise or type a new one.',
            title: 'Add exercise',
        },
        errors: {
            addExerciseFailed: 'Could not add this exercise. Try again.',
            discardFailed: 'Could not discard this gym session. Try again.',
            finishFailed: 'Could not finish this gym session. Try again.',
            removeExerciseFailed: 'Could not remove this exercise. Try again.',
        },
    },
    gymHistory: {
        title: 'Gym history',
        searchPlaceholder: 'Search gym sessions',
        emptyTitle: 'No gym sessions yet',
        emptyDescription: 'Complete a gym session and it will appear here.',
        searchEmptyTitle: 'No gym sessions found',
        searchEmptyDescription: 'Try a different date.',
        sessionTitle: 'Gym session',
        confirmRemoveBulk: {
            title_one: 'Delete {{count}} gym session?',
            title_other: 'Delete {{count}} gym sessions?',
            message_one:
                'This will permanently delete the selected gym session.',
            message_other:
                'This will permanently delete the {{count}} selected gym sessions.',
        },
    },
    gymSessionSummary: {
        title: 'Gym session',
        notFound: 'Gym session not found',
        endedAt: 'Ended {{time}}',
        completedSets: 'Done sets',
        exercises: 'Exercises',
        noExercises: 'No exercises in this session',
        notes: 'Notes',
        actions: {
            delete: 'Delete',
            openGymPlan: 'Go to gym plan',
            runAgain: 'Run again',
        },
        hints: {
            noSourceGymPlan:
                'The original plan is unavailable. Run again will replay this session structure.',
        },
        errors: {
            runAgainFailed: 'Could not start this gym session again.',
        },
        status: {
            incomplete: 'Not finished',
        },
        deleteConfirm: {
            title: 'Delete gym session',
            message: 'This gym session will be permanently deleted.',
            confirm: 'Delete',
        },
    },
    gymExerciseData: {
        title: 'Exercise Data',
        exerciseSets: 'Exercise Sets',
        overview: 'Overview',
        exercise: 'Exercise',
        exerciseFallback: 'Exercise',
        sets: 'Sets',
        setWithIndex: 'Set {{index}}',
        newSet: 'New set',
        noSetsTitle: 'No sets yet',
        noSetsDescription:
            'Add working data once a set has reps, weight, time, or distance.',
        notFoundTitle: 'Exercise not found',
        notFoundDescription: 'This exercise is not in the active gym session.',
        actions: {
            addSet: 'Add set',
            backToSession: 'Back to session',
            completeSet: 'Done',
            deleteSet: 'Delete',
            options: 'More',
            saveSet: 'Save set',
            trackingFields: 'Tracking fields',
        },
        fields: {
            distanceMeters: 'Distance',
            durationSec: 'Duration',
            reps: 'Reps',
            weightKg: 'Weight',
        },
        fieldsByKey: {
            hasDistanceMeters: 'Distance',
            hasDurationSec: 'Duration',
            hasReps: 'Reps',
            hasRpe: 'RPE',
            hasWeight: 'Weight',
        },
        defaults: {
            description:
                'Choose what this exercise tracks. Reps and weight are enabled by default.',
            removeDataAndSave: 'Remove data and save',
            removeDataWarning:
                'Saving will remove existing values for: {{fields}}.',
            title: 'Tracking fields',
        },
        editSet: {
            description: 'Update the values tracked for this set.',
            title: 'Edit set',
        },
        status: {
            complete: 'Complete',
            inProgress: 'In progress',
        },
        deleteConfirm: {
            message: 'This set will be permanently deleted.',
            title: 'Delete set',
        },
        deleteConfirmBulk: {
            message: '{{count}} sets will be permanently deleted.',
            title: 'Delete {{count}} sets',
        },
        setDetails: {
            distance: '{{value}} km',
            duration: '{{value}}',
            empty: 'No set data',
            reps_one: '{{count}} rep',
            reps_other: '{{count}} reps',
            rpe: 'RPE {{value}}',
            weight: '{{value}} kg',
        },
        errors: {
            addSetFailed: 'Could not save this set. Try again.',
            deleteSetFailed: 'Could not delete this set. Try again.',
            updateSetFailed: 'Could not update this set. Try again.',
        },
    },
    history: {
        title: 'History',
        searchPlaceholder: 'Search workouts',
        clear: 'Clear',
        emptyTitle: 'No sessions yet',
        emptyDescription: 'Run a workout and it will appear here.',
        searchEmptyTitle: 'No sessions found',
        searchEmptyDescription: 'Try a different workout name.',
        clearConfirm: {
            title: 'Clear history',
            message: 'All workout sessions will be deleted.',
            confirm: 'Clear',
            cancel: 'Cancel',
        },
        confirmRemoveBulk: {
            title_one: 'Delete {{count}} session',
            title_other: 'Delete {{count}} sessions',
            message_one: 'This will permanently delete the selected session.',
            message_other:
                'This will permanently delete the {{count}} selected sessions.',
        },
    },
    historySession: {
        title: 'Session',
        notFound: 'Session not found',
        workoutSessionFallback: 'Workout session',
        endedAt: 'Ended {{time}}',
        byBlock: 'By block',
        noCompletedBlocks: 'No completed blocks in this session',
        blockStats: {
            sets: 'Sets:',
            exercises: 'Exercises:',
            work: 'Work:',
            rest: 'Rest:',
        },
        actions: {
            openWorkout: 'Open workout',
            saveWorkout: 'Save workout',
            runAgain: 'Run again',
            delete: 'Delete',
        },
        deleteConfirm: {
            title: 'Delete session',
            message: 'This workout session will be permanently deleted.',
            confirm: 'Delete',
            cancel: 'Cancel',
        },
        hints: {
            noSavedWorkout: 'No saved workout found for this session.',
            workoutEditedSinceSession: 'Workout edited since this session.',
        },
    },
    workoutBlockItem: {
        summary: {
            timeEach: '{{value}}s each',
            repsEach: '{{value}} reps each',
        },
        exerciseMeta: {
            time: '{{value}}s',
            reps_one: '{{count}} rep',
            reps_other: '{{count}} reps',
            rest: 'Rest {{value}}s',
        },
        labels: {
            exerciseWithIndex: 'Exercise {{index}}',
        },
    },
    editWorkout: {
        title: {
            edit: 'Edit Workout',
            create: 'New Workout',
        },
        fields: {
            name: 'Name',
            namePlaceholder: 'e.g., Conditioning A',
        },
        defaults: {
            newWorkout: 'New Workout',
        },
        sections: {
            blocks: 'Blocks',
        },
        hints: {
            tapBlockToEdit: 'Tap a block to edit its details.',
        },
        actions: {
            addBlock: '＋ Add Block',
            cancel: 'Cancel',
            save: 'Save',
            create: 'Create',
        },
        validation: {
            nameRequired: 'Workout name is required.',
            addBlock: 'Add at least one block.',
            exerciseNamesRequired: 'Exercises must have defined names.',
            saveFailed:
                'Could not save workout. Check the details and try again.',
            unnamedExercises:
                'Exercises must have defined names before saving.',
        },
        removeBlock: {
            title: 'Remove block',
            message:
                'This will permanently delete the block from this workout.',
            confirm: 'Remove',
            cancel: 'Cancel',
        },
    },
    editBlock: {
        title: {
            edit: 'Edit Block',
            quick: 'Quick Workout',
        },
        notFound: 'Block not found.',
        sections: {
            setup: 'Block setup',
            structure: 'Exercises',
            timing: 'Rest',
            exercises: 'Exercises',
        },
        fields: {
            blockTitle: 'Block name',
            durationSec: 'Duration',
            exerciseDurationSec: 'Default duration',
            restBetweenExercisesSec: 'Between exercises',
            setsInBlock: 'Sets',
            restBetweenSetsSec: 'Between sets',
        },
        units: {
            secondsShort: 's',
        },
        actions: {
            addExercise: '＋ Add Exercise',
            cancel: 'Cancel',
            startWorkout: 'Start Workout',
            saveBlock: 'Save Block',
        },
        removeExercise: {
            title: 'Remove exercise',
            message: 'This exercise will be removed from the block.',
            confirm: 'Remove',
            cancel: 'Cancel',
        },
        validation: {
            setsMin: 'Block must have at least one set.',
            exercisesMin: 'Add at least one exercise.',
            exerciseNameRequired: 'Exercise name is required before saving.',
            exerciseDurationMin:
                'Exercise {{index}}: duration must be > 0 seconds.',
            exerciseRepsMin: 'Exercise {{index}}: reps must be > 0.',
        },
    },
    settings: {
        title: 'Settings',
        sections: {
            appearance: 'Appearance',
            sound: 'Sound',
            language: 'Language',
            about: 'About',
        },
        descriptions: {
            theme: 'Select your preferred theme',
            accent: 'Select your preferred color accent',
            sound: 'Enable sound effects',
            language: 'Select your preferred language',
        },
        theme: {
            light: 'Light',
            dark: 'Dark',
            system: 'System',
        },
        sound: {
            on: 'On',
            off: 'Off',
        },
        languages: {
            en: 'English',
            ptPT: 'Portuguese (Portugal)',
        },
        accents: {
            classic: 'Classic',
            violet: 'Violet',
            cyan: 'Cyan',
            amber: 'Amber',
            neutral: 'Neutral',
        },
        about: {
            version: 'Version {{version}}',
        },
    },
    workouts: {
        title: 'Workouts',
        searchPlaceholder: 'Search workouts',
        newButton: '＋ New',
        createButton: '＋ Create workout',
        defaults: {
            quickWorkoutName: 'Quick Workout',
            quickBlockTitle: 'Quick Block',
        },
        emptyTitle: 'No workouts yet',
        emptyDescription: 'Create your first workout to get started.',
        searchEmptyTitle: 'No workouts found',
        searchEmptyDescription: 'Try a different workout name.',
        item: {
            untitled: 'Untitled workout',
        },
        confirmRemove: {
            title: 'Remove workout',
            message: 'This will permanently delete the workout.',
            confirm: 'Remove',
            cancel: 'Cancel',
        },
        confirmRemoveBulk: {
            title_one: 'Remove {{count}} workout',
            title_other: 'Remove {{count}} workouts',
            message_one: 'This will permanently delete the selected workout.',
            message_other:
                'This will permanently delete the {{count}} selected workouts.',
        },
        modal: {
            title: 'New workout',
            subtitle: 'Choose how you want to start:',
            createNew: 'Create new',
            importFromFile: 'Import from file',
            cancel: 'Cancel',
        },
        import: {
            errors: {
                invalidExtension:
                    'That file is not an ARC Timer workout (.arcw).',
                invalidKind: 'That file is not an ARC Timer workout export.',
                invalidShape:
                    'That file looks like an ARC Timer export, but it is missing data.',
                parseFailed: 'The file is corrupted or not valid JSON.',
                readFailed: 'Could not read the selected file.',
                unexpected: 'Import failed due to an unexpected error.',
            },
        },
    },
    exerciseDefinitions: {
        title: 'Exercises',
        detailsTitle: 'Exercise',
        searchPlaceholder: 'Search exercises',
        newButton: '＋ New',
        createButton: '＋ Create exercise',
        emptyTitle: 'No exercises yet',
        emptyDescription: 'Create your first exercise to build your catalog.',
        searchEmptyTitle: 'No exercises found',
        searchEmptyDescription: 'Try a different exercise name.',
        notFound: 'Exercise not found.',
        overview: 'Overview',
        defaults: 'Default Fields',
        statsTitle: 'Exercise Stats',
        notes: 'Notes',
        emptyValue: 'Not set',
        emptyDefaultsTitle: 'No default fields',
        emptyDefaultsDescription:
            'Choose the fields this exercise should start with.',
        emptyStatsTitle: 'No stats yet',
        emptyStatsDescription:
            'Complete gym sessions to build personal records.',
        emptyRecentSessionsTitle: 'No recent sessions',
        emptyRecentSessionsDescription:
            'Completed sessions with this exercise will appear here.',
        fields: {
            name: 'Name',
            namePlaceholder: 'e.g., Push-ups',
            availability: 'Availability',
            source: 'Source',
            trackingFields: 'Tracking fields',
            defaultReps: 'Default reps',
            defaultWeight: 'Default weight',
            defaultDuration: 'Default duration',
            defaultDistance: 'Default distance',
            defaultRpe: 'Default RPE',
            weightPr: 'Weight PR',
            distancePr: 'Distance PR',
            lastCompletedSession: 'Last session',
            recentSessions: 'Recent sessions',
        },
        trackingField: {
            reps: 'Reps',
            weight: 'Weight',
            duration: 'Duration',
            distance: 'Distance',
            rpe: 'RPE',
        },
        source: {
            system: 'System',
            user: 'Custom',
        },
        availability: {
            both: 'Workout + Gym',
            workout: 'Workout',
            gym: 'Gym',
        },
        modal: {
            createTitle: 'New exercise',
            editTitle: 'Edit exercise',
            subtitle: 'Keep your exercise catalog clear and reusable.',
            create: 'Create',
            save: 'Save',
        },
        trackingModal: {
            title: 'Tracking defaults',
            subtitle:
                'Choose which fields this exercise should use by default.',
            removeDefaultAndSave: 'Remove defaults and save',
            removeDefaultWarning:
                'Saving will clear default values for: {{fields}}.',
        },
        defaultValueModal: {
            title: 'Set {{field}}',
            description: 'Leave this blank when there is no default value.',
        },
        nameModal: {
            title: 'Edit name',
            description: 'Rename this exercise across your catalog.',
        },
        availabilityModal: {
            title: 'Edit availability',
            description: 'Choose where this exercise can be used.',
        },
        confirmRemove: {
            title: 'Delete exercise?',
            message: 'This exercise will be removed if it is not in use.',
            confirm: 'Delete exercise',
        },
        confirmRemoveBulk: {
            title_one: 'Delete {{count}} exercise?',
            title_other: 'Delete {{count}} exercises?',
            message_one:
                'The selected exercise will be removed if it is not in use.',
            message_other:
                'Selected exercises will be removed if they are not in use.',
        },
        validation: {
            nameRequired: 'Exercise name is required.',
            duplicateName: 'An exercise with this name already exists.',
            deleteReferenced:
                'This exercise is still used and cannot be deleted.',
            deleteSystemForbidden: 'System exercises cannot be deleted.',
            gymOnlyRestricted:
                'This exercise is used in a workout and cannot be set to gym only.',
            mergeGymOnlyConflict:
                'A workout exercise cannot be merged into a gym-only exercise.',
            mergeWorkoutOnlyConflict:
                'A gym exercise cannot be merged into a workout-only exercise.',
            workoutOnlyRestricted:
                'This exercise is used in a gym plan and cannot be set to workout only.',
            saveFailed:
                'Could not save exercise. Check the details and try again.',
            deleteFailed: 'Could not delete exercise.',
        },
    },
    workoutSummary: {
        title: 'Workout',
        notFound: 'Workout not found.',
        overview: 'Overview',
        favorite: 'Favorite',
        cardTitle: 'Workout summary',
        metrics: {
            blocks: 'Blocks',
            exercises: 'Exercises',
            estimatedTime: 'Estimated time',
        },
        blocksSection: 'Blocks',
        hint: 'You can edit this workout or start it now.',
        exportWorkout: 'Export workout',
        actions: {
            edit: 'Edit',
            start: 'Start',
        },
        export: {
            sharingUnavailable: 'Sharing is not available on this device.',
            writeFailed: 'Could not prepare the file for sharing.',
            failed: 'Failed to export workout.',
        },
    },
    run: {
        title: 'Run workout',
        emptyTitle: 'No steps to run',
        emptyDescription: 'This workout has no timed steps configured.',
        donePill: 'Done',
        phase: {
            work: 'Work',
            setRest: 'Set rest',
            rest: 'Rest',
            prepare: 'Prepare',
        },
        top: {
            blocks: 'Blocks',
            exercises: 'Exercises',
            completeTitle: 'Workout complete',
        },
        section: {
            nextBlock: 'Next Block:',
            exercise: 'Exercise',
            next: 'Next',
        },
        confirmEnd: {
            title: 'End workout?',
            message: 'Your progress will be saved in the summary.',
            confirm: 'End workout',
            cancel: 'Keep going',
        },
        actions: {
            backToHome: 'Back to home',
            holdToStartBlock: 'Hold to start Block',
            end: 'End',
            skip: 'Skip',
            start: 'Start',
            pause: 'Pause',
            resume: 'Resume',
            continue: 'Continue',
            done: 'Done',
        },
        stats: {
            title: 'Session stats',
            duration: 'Duration',
            sets: 'Sets',
            exercises: 'Exercises',
            workTime: 'Work time',
            restTime: 'Rest time',
            pausedTime: 'Paused time',
        },
        shareCard: {
            title: 'Workout complete',
        },
    },
};
