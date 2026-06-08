export interface I18nResource {
    common: {
        actions: {
            back: string;
            cancel: string;
            remove: string;
            edit: string;
            save: string;
            start: string;
            share: string;
            done: string;
        };
        status: {
            noTimeEstimate: string;
            mixedTimeAndReps: string;
        };
        units: {
            block_one: string;
            block_other: string;
            set_one: string;
            set_other: string;
            exercise_one: string;
            exercise_other: string;
        };
        labels: {
            blockWithIndex: string;
            exerciseWithIndex: string;
        };
        selectMode: {
            enter: string;
            /** Expects {{count}} interpolation */
            countSelected_one: string;
            countSelected_other: string;
            countSelected_zero: string;
            selectAll: string;
            deleteSelected_one: string;
            deleteSelected_other: string;
        };
    };
    drawer: {
        home: string;
        hiit: string;
        workouts: string;
        gym: string;
        exercises: string;
        history: string;
        settings: string;
        quickAccess: string;
    };
    bootstrap: {
        databaseError: {
            title: string;
            description: string;
            retry: string;
        };
    };
    home: {
        title: string;
        welcome: string;
        subtitle: string;
        quickAccess: string;
        quickSession: string;
        startImmediately: string;
        recentSessions: string;
        noSessionsYet: string;
        sessionTypeModal: {
            title: string;
            description: string;
        };
        actions: {
            gymPlans: string;
            savedHiitWorkouts: string;
            seeAllSessions: string;
            startGymSession: string;
            startHiitWorkout: string;
        };
    };
    gym: {
        title: string;
        heading: string;
        subtitle: string;
        currentSession: string;
        sessionStats: string;
        actions: {
            startNewSession: string;
            startNewSessionSubtitle: string;
            resumeSession: string;
            finishSession: string;
            history: string;
            historySubtitle: string;
            plans: string;
            plansSubtitle: string;
        };
        finishSessionModal: {
            title: string;
            message: string;
            complete: string;
            discard: string;
        };
        status: {
            active: string;
            none: string;
        };
        errors: {
            activeSessionExists: string;
            activeSessionCannotBeDeleted: string;
            activeSessionNotFound: string;
            exerciseDefinitionNotFound: string;
            exerciseDefinitionNotGymAvailable: string;
            exerciseRecordNotFound: string;
            exerciseRecordNotInActiveSession: string;
            exerciseNameRequired: string;
            exerciseSetNotFound: string;
            gymPlanArchived: string;
            gymPlanNotFound: string;
            invalidGymExerciseRecordTimeRange: string;
            invalidGymPlan: string;
            invalidGymSessionTimeRange: string;
            invalidGymSet: string;
            sessionNotFound: string;
            sessionNotMutable: string;
            startFailed: string;
        };
    };
    gymPlans: {
        title: string;
        searchPlaceholder: string;
        emptyTitle: string;
        emptyDescription: string;
        searchEmptyTitle: string;
        searchEmptyDescription: string;
        actions: {
            createPlan: string;
            new: string;
        };
        modal: {
            title: string;
            subtitle: string;
            createNew: string;
            importFromFile: string;
            resumeDraft: string;
            cancel: string;
        };
        import: {
            errors: {
                invalidExtension: string;
                invalidKind: string;
                invalidShape: string;
                parseFailed: string;
                readFailed: string;
                unexpected: string;
            };
        };
        confirmRemove: {
            title: string;
            message: string;
            confirm: string;
        };
        confirmRemoveBulk: {
            title_one: string;
            title_other: string;
            message_one: string;
            message_other: string;
        };
        card: {
            label: string;
            sections_one: string;
            sections_other: string;
            exercises_one: string;
            exercises_other: string;
        };
    };
    gymPlanDetails: {
        title: string;
        notFound: string;
        overview: string;
        cardTitle: string;
        sections: string;
        sectionFallback: string;
        exerciseCount_one: string;
        exerciseCount_other: string;
        exerciseFallback: string;
        noTargets: string;
        favorite: string;
        hint: string;
        exportGymPlan: string;
        metrics: {
            sections: string;
            exercises: string;
            targetSets: string;
        };
        actions: {
            start: string;
            edit: string;
            favorite: string;
            unfavorite: string;
            archive: string;
            restore: string;
            delete: string;
        };
        targets: {
            sets_one: string;
            sets_other: string;
            reps_one: string;
            reps_other: string;
            weightKg: string;
            durationSec: string;
        };
        deleteConfirm: {
            title: string;
            message: string;
            confirm: string;
        };
        export: {
            sharingUnavailable: string;
            writeFailed: string;
            failed: string;
        };
        errors: {
            actionFailed: string;
        };
    };
    gymPlanBuilder: {
        title: string;
        draftMissing: string;
        sectionFallback: string;
        exerciseFallback: string;
        exerciseCount_one: string;
        exerciseCount_other: string;
        plannedSetCount_one: string;
        plannedSetCount_other: string;
        noTargets: string;
        sections: {
            details: string;
            plan: string;
        };
        hints: {
            tapSectionToEdit: string;
        };
        fields: {
            name: string;
            namePlaceholder: string;
            description: string;
            descriptionPlaceholder: string;
            sectionTitle: string;
            targetWeightKg: string;
            notes: string;
        };
        actions: {
            addSection: string;
            addExercise: string;
            addNote: string;
            removeNote: string;
            removeSection: string;
            save: string;
            saveSection: string;
        };
        exercisePicker: {
            title: string;
            searchPlaceholder: string;
        };
        exerciseCard: {
            label: string;
        };
        targetFields: {
            description: string;
            removeDataAndSave: string;
            removeDataWarning: string;
            title: string;
        };
        sectionEditor: {
            exercises: string;
            notFound: string;
            tapExerciseToEdit: string;
            title: string;
        };
        targets: {
            sets_one: string;
            sets_other: string;
            reps_one: string;
            reps_other: string;
            weightKg: string;
        };
        validation: {
            nameRequired: string;
            sectionRequired: string;
            sectionExerciseRequired: string;
            saveFailed: string;
        };
        discardConfirm: {
            title: string;
            message: string;
            confirm: string;
        };
        removeSectionConfirm: {
            title: string;
            message: string;
        };
        removeExerciseConfirm: {
            title: string;
            message: string;
        };
    };
    gymPlanExerciseEdit: {
        title: string;
        notFound: string;
        exerciseName: string;
        exerciseNamePlaceholder: string;
        newExerciseTitle: string;
        exerciseFallback: string;
        targets: string;
        notes: string;
        hint: string;
        errors: {
            nameRequired: string;
            saveFailed: string;
        };
    };
    gymActiveSession: {
        title: string;
        duration: string;
        startedAt: string;
        sets: string;
        exercises: string;
        emptyTitle: string;
        noExercisesTitle: string;
        noExercisesDescription: string;
        status: {
            complete: string;
            inProgress: string;
            live: string;
        };
        sections: {
            addedExercises: string;
        };
        actions: {
            addExercise: string;
            backToGym: string;
            discard: string;
            end: string;
            finish: string;
            removeExercise: string;
        };
        removeExerciseConfirm: {
            title: string;
            message: string;
        };
        addExerciseModal: {
            create: string;
            name: string;
            namePlaceholder: string;
            nameRequired: string;
            subtitle: string;
            title: string;
        };
        errors: {
            addExerciseFailed: string;
            discardFailed: string;
            finishFailed: string;
            removeExerciseFailed: string;
        };
    };
    gymHistory: {
        title: string;
        searchPlaceholder: string;
        emptyTitle: string;
        emptyDescription: string;
        searchEmptyTitle: string;
        searchEmptyDescription: string;
        sessionTitle: string;
        confirmRemoveBulk: {
            title_one: string;
            title_other: string;
            message_one: string;
            message_other: string;
        };
    };
    gymSessionSummary: {
        title: string;
        notFound: string;
        endedAt: string;
        completedSets: string;
        exercises: string;
        noExercises: string;
        notes: string;
        actions: {
            delete: string;
            openGymPlan: string;
            runAgain: string;
        };
        hints: {
            noSourceGymPlan: string;
        };
        errors: {
            runAgainFailed: string;
        };
        status: {
            incomplete: string;
        };
        deleteConfirm: {
            title: string;
            message: string;
            confirm: string;
        };
    };
    gymExerciseData: {
        title: string;
        exerciseSets: string;
        overview: string;
        exercise: string;
        exerciseFallback: string;
        sets: string;
        setWithIndex: string;
        newSet: string;
        noSetsTitle: string;
        noSetsDescription: string;
        notFoundTitle: string;
        notFoundDescription: string;
        actions: {
            addSet: string;
            backToSession: string;
            completeSet: string;
            deleteSet: string;
            options: string;
            saveSet: string;
            trackingFields: string;
        };
        fields: {
            distanceMeters: string;
            durationSec: string;
            reps: string;
            weightKg: string;
        };
        fieldsByKey: {
            hasDistanceMeters: string;
            hasDurationSec: string;
            hasReps: string;
            hasRpe: string;
            hasWeight: string;
        };
        defaults: {
            description: string;
            removeDataAndSave: string;
            removeDataWarning: string;
            title: string;
        };
        editSet: {
            description: string;
            title: string;
        };
        status: {
            complete: string;
            inProgress: string;
        };
        deleteConfirm: {
            message: string;
            title: string;
        };
        deleteConfirmBulk: {
            message: string;
            title: string;
        };
        setDetails: {
            distance: string;
            duration: string;
            empty: string;
            reps_one: string;
            reps_other: string;
            rpe: string;
            weight: string;
        };
        errors: {
            addSetFailed: string;
            deleteSetFailed: string;
            updateSetFailed: string;
        };
    };
    history: {
        title: string;
        searchPlaceholder: string;
        clear: string;
        emptyTitle: string;
        emptyDescription: string;
        filterEmptyTitle: string;
        filterEmptyDescription: string;
        searchEmptyTitle: string;
        searchEmptyDescription: string;
        filters: {
            all: string;
            apply: string;
            clear: string;
            gym: string;
            hiit: string;
            sessionType: string;
            title: string;
        };
        kind: {
            gym: string;
            hiit: string;
        };
        clearConfirm: {
            title: string;
            message: string;
            confirm: string;
            cancel: string;
        };
        confirmRemoveBulk: {
            title_one: string;
            title_other: string;
            message_one: string;
            message_other: string;
        };
    };
    historySession: {
        title: string;
        notFound: string;
        workoutSessionFallback: string;
        endedAt: string;
        byBlock: string;
        noCompletedBlocks: string;
        blockStats: {
            sets: string;
            exercises: string;
            work: string;
            rest: string;
        };
        actions: {
            openWorkout: string;
            saveWorkout: string;
            runAgain: string;
            delete: string;
        };
        deleteConfirm: {
            title: string;
            message: string;
            confirm: string;
            cancel: string;
        };
        hints: {
            noSavedWorkout: string;
            workoutEditedSinceSession: string;
        };
    };
    workoutBlockItem: {
        summary: {
            timeEach: string;
            repsEach: string;
        };
        exerciseMeta: {
            time: string;
            reps_one: string;
            reps_other: string;
            rest: string;
        };
        labels: {
            exerciseWithIndex: string;
        };
    };
    editWorkout: {
        title: {
            edit: string;
            create: string;
        };
        fields: {
            name: string;
            namePlaceholder: string;
        };
        defaults: {
            newWorkout: string;
        };
        sections: {
            blocks: string;
        };
        hints: {
            tapBlockToEdit: string;
        };
        actions: {
            addBlock: string;
            cancel: string;
            save: string;
            create: string;
        };
        validation: {
            nameRequired: string;
            addBlock: string;
            exerciseNamesRequired: string;
            saveFailed: string;
            unnamedExercises: string;
        };
        removeBlock: {
            title: string;
            message: string;
            confirm: string;
            cancel: string;
        };
    };
    editBlock: {
        title: {
            edit: string;
            quick: string;
        };
        notFound: string;
        sections: {
            setup: string;
            structure: string;
            timing: string;
            exercises: string;
        };
        fields: {
            blockTitle: string;
            durationSec: string;
            exerciseDurationSec: string;
            restBetweenExercisesSec: string;
            setsInBlock: string;
            restBetweenSetsSec: string;
        };
        units: {
            secondsShort: string;
        };
        actions: {
            addExercise: string;
            cancel: string;
            startWorkout: string;
            saveBlock: string;
        };
        removeExercise: {
            title: string;
            message: string;
            confirm: string;
            cancel: string;
        };
        validation: {
            setsMin: string;
            exercisesMin: string;
            exerciseNameRequired: string;
            exerciseDurationMin: string;
            exerciseRepsMin: string;
        };
    };
    settings: {
        title: string;
        sections: {
            appearance: string;
            sound: string;
            language: string;
            about: string;
        };
        descriptions: {
            theme: string;
            accent: string;
            sound: string;
            language: string;
        };
        theme: {
            light: string;
            dark: string;
            system: string;
        };
        sound: {
            on: string;
            off: string;
        };
        languages: {
            en: string;
            ptPT: string;
        };
        accents: {
            classic: string;
            violet: string;
            cyan: string;
            amber: string;
            neutral: string;
        };
        about: {
            version: string;
        };
    };
    workouts: {
        title: string;
        searchPlaceholder: string;
        newButton: string;
        createButton: string;
        defaults: {
            quickWorkoutName: string;
            quickBlockTitle: string;
        };
        emptyTitle: string;
        emptyDescription: string;
        searchEmptyTitle: string;
        searchEmptyDescription: string;
        item: {
            untitled: string;
        };
        confirmRemove: {
            title: string;
            message: string;
            confirm: string;
            cancel: string;
        };
        confirmRemoveBulk: {
            title_one: string;
            title_other: string;
            message_one: string;
            message_other: string;
        };
        modal: {
            title: string;
            subtitle: string;
            createNew: string;
            importFromFile: string;
            cancel: string;
        };
        import: {
            errors: {
                invalidExtension: string;
                invalidKind: string;
                invalidShape: string;
                parseFailed: string;
                readFailed: string;
                unexpected: string;
            };
        };
    };
    exerciseDefinitions: {
        title: string;
        detailsTitle: string;
        searchPlaceholder: string;
        newButton: string;
        createButton: string;
        emptyTitle: string;
        emptyDescription: string;
        searchEmptyTitle: string;
        searchEmptyDescription: string;
        notFound: string;
        overview: string;
        defaults: string;
        statsTitle: string;
        notes: string;
        emptyValue: string;
        emptyDefaultsTitle: string;
        emptyDefaultsDescription: string;
        emptyStatsTitle: string;
        emptyStatsDescription: string;
        emptyRecentSessionsTitle: string;
        emptyRecentSessionsDescription: string;
        fields: {
            name: string;
            namePlaceholder: string;
            availability: string;
            source: string;
            trackingFields: string;
            defaultReps: string;
            defaultWeight: string;
            defaultDuration: string;
            defaultDistance: string;
            defaultRpe: string;
            weightPr: string;
            distancePr: string;
            lastCompletedSession: string;
            recentSessions: string;
        };
        trackingField: {
            reps: string;
            weight: string;
            duration: string;
            distance: string;
            rpe: string;
        };
        source: {
            system: string;
            user: string;
        };
        availability: {
            both: string;
            workout: string;
            gym: string;
        };
        modal: {
            createTitle: string;
            editTitle: string;
            subtitle: string;
            create: string;
            save: string;
        };
        trackingModal: {
            title: string;
            subtitle: string;
            removeDefaultAndSave: string;
            removeDefaultWarning: string;
        };
        defaultValueModal: {
            title: string;
            description: string;
        };
        nameModal: {
            title: string;
            description: string;
        };
        availabilityModal: {
            title: string;
            description: string;
        };
        references: {
            title: string;
            workout: string;
            gymPlan: string;
        };
        confirmRemove: {
            title: string;
            message: string;
            confirm: string;
        };
        confirmRemoveBulk: {
            title_one: string;
            title_other: string;
            message_one: string;
            message_other: string;
        };
        deleteUnavailable: {
            title: string;
            referenced: string;
            system: string;
        };
        validation: {
            nameRequired: string;
            duplicateName: string;
            deleteReferenced: string;
            deleteSystemForbidden: string;
            gymOnlyRestricted: string;
            mergeGymOnlyConflict: string;
            mergeWorkoutOnlyConflict: string;
            workoutOnlyRestricted: string;
            saveFailed: string;
            deleteFailed: string;
        };
    };
    workoutSummary: {
        title: string;
        notFound: string;
        overview: string;
        favorite: string;
        cardTitle: string;
        metrics: {
            blocks: string;
            exercises: string;
            estimatedTime: string;
        };
        blocksSection: string;
        hint: string;
        exportWorkout: string;
        actions: {
            edit: string;
            start: string;
        };
        export: {
            sharingUnavailable: string;
            writeFailed: string;
            failed: string;
        };
    };
    run: {
        title: string;
        emptyTitle: string;
        emptyDescription: string;
        donePill: string;
        phase: {
            work: string;
            setRest: string;
            rest: string;
            prepare: string;
        };
        top: {
            blocks: string;
            exercises: string;
            completeTitle: string;
        };
        section: {
            nextBlock: string;
            exercise: string;
            next: string;
        };
        confirmEnd: {
            title: string;
            message: string;
            confirm: string;
            cancel: string;
        };
        actions: {
            backToHome: string;
            holdToStartBlock: string;
            end: string;
            skip: string;
            start: string;
            pause: string;
            resume: string;
            continue: string;
            done: string;
        };
        stats: {
            title: string;
            duration: string;
            sets: string;
            exercises: string;
            workTime: string;
            restTime: string;
            pausedTime: string;
        };
        shareCard: {
            title: string;
        };
    };
}
