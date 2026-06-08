import type { I18nResource } from './interfaces';

const exerciseNameRequired = 'Nome do exercício obrigatório.';

export const ptPT: I18nResource = {
    common: {
        actions: {
            back: 'Voltar',
            cancel: 'Cancelar',
            remove: 'Remover',
            edit: 'Editar',
            save: 'Guardar',
            start: 'Iniciar',
            share: 'Partilhar',
            done: 'Concluído',
        },
        status: {
            noTimeEstimate: 'Sem estimativa de tempo',
            mixedTimeAndReps: 'Misto (tempo + repetições)',
        },
        units: {
            block_one: '{{count}} bloco',
            block_other: '{{count}} blocos',
            set_one: '{{count}} série',
            set_other: '{{count}} séries',
            exercise_one: '{{count}} exercício',
            exercise_other: '{{count}} exercícios',
        },
        labels: {
            blockWithIndex: 'Bloco {{index}}',
            exerciseWithIndex: 'Exercício {{index}}',
        },
        selectMode: {
            enter: 'Selecionar',
            countSelected_zero: 'Selecionar itens',
            countSelected_one: '{{count}} selecionado',
            countSelected_other: '{{count}} selecionados',
            selectAll: 'Selecionar tudo',
            deleteSelected_one: 'Eliminar {{count}} item',
            deleteSelected_other: 'Eliminar {{count}} itens',
        },
    },
    drawer: {
        home: 'Início',
        hiit: 'HIIT',
        workouts: 'Treinos',
        gym: 'Ginásio',
        exercises: 'Exercícios',
        history: 'Histórico',
        settings: 'Definições',
        quickAccess: 'Acesso rápido',
    },
    bootstrap: {
        databaseError: {
            title: 'Algo correu mal',
            description:
                'Arc Timer não conseguiu preparar os teus dados. Reinicia a app ou tenta novamente.',
            retry: 'Tentar novamente',
        },
    },
    home: {
        title: 'Início',
        welcome: 'Bem-vindo',
        subtitle: 'Começa já o teu treino.',
        quickAccess: 'Acesso rápido',
        quickSession: 'Sessão rápida',
        startImmediately: 'Começar treino imediatamente',
        recentSessions: 'Sessões recentes',
        noSessionsYet: 'Ainda não existem sessões.',
        sessionTypeModal: {
            title: 'Escolhe uma sessão',
            description: 'Inicia um treino HIIT ou uma sessão de ginásio.',
        },
        actions: {
            gymPlans: 'Planos de ginásio',
            savedHiitWorkouts: 'Treinos HIIT',
            seeAllSessions: 'Ver todas',
            startGymSession: 'Iniciar sessão de ginásio',
            startHiitWorkout: 'Iniciar treino HIIT',
        },
    },
    gym: {
        title: 'Ginásio',
        heading: 'Sessão de ginásio',
        subtitle: 'Regista o teu progresso no ginásio.',
        currentSession: 'Sessão atual',
        sessionStats: 'Dados da sessão',
        actions: {
            startNewSession: 'Sessão rápida',
            startNewSessionSubtitle: 'Cria a sessão à medida que treinas',
            resumeSession: 'Retomar sessão',
            finishSession: 'Terminar sessão',
            history: 'Histórico de sessões',
            historySubtitle: 'Ver sessões anteriores',
            plans: 'Planos de ginásio',
            plansSubtitle: 'Modelos de sessão reutilizáveis',
        },
        finishSessionModal: {
            title: 'Terminar sessão?',
            message:
                'Conclui a sessão para guardar no histórico ou descarta-a sem manter registo.',
            complete: 'Concluir',
            discard: 'Descartar',
        },
        status: {
            active: 'Já existe uma sessão de ginásio ativa.',
            none: 'Sem sessão de ginásio ativa.',
        },
        errors: {
            activeSessionExists: 'Já existe uma sessão de ginásio ativa.',
            activeSessionCannotBeDeleted:
                'As sessões de ginásio ativas têm de ser concluídas ou descartadas.',
            activeSessionNotFound:
                'Não foi encontrada uma sessão de ginásio ativa.',
            exerciseDefinitionNotFound: 'O exercício não foi encontrado.',
            exerciseDefinitionNotGymAvailable:
                'Este exercício não pode ser usado em sessões de ginásio.',
            exerciseRecordNotFound:
                'O registo do exercício não foi encontrado.',
            exerciseRecordNotInActiveSession:
                'O registo do exercício não pertence à sessão ativa.',
            exerciseNameRequired,
            exerciseSetNotFound: 'A série do exercício não foi encontrada.',
            gymPlanArchived: 'Planos arquivados não podem iniciar uma sessão.',
            gymPlanNotFound: 'O plano de ginásio não foi encontrado.',
            invalidGymExerciseRecordTimeRange:
                'O registo do exercício não pode terminar antes de começar.',
            invalidGymPlan: 'O plano de ginásio é inválido.',
            invalidGymSessionTimeRange:
                'A sessão de ginásio não pode terminar antes de começar.',
            invalidGymSet:
                'A série precisa de repetições, peso, duração ou distância.',
            sessionNotFound: 'A sessão de ginásio não foi encontrada.',
            sessionNotMutable: 'A sessão de ginásio não está ativa.',
            startFailed: 'Não foi possível iniciar a sessão. Tenta novamente.',
        },
    },
    gymPlans: {
        title: 'Planos de ginásio',
        searchPlaceholder: 'Pesquisar planos de ginásio',
        emptyTitle: 'Ainda não existem planos',
        emptyDescription:
            'Cria um plano reutilizável para as tuas sessões de ginásio.',
        searchEmptyTitle: 'Nenhum plano encontrado',
        searchEmptyDescription: 'Experimenta outro nome de plano.',
        actions: {
            createPlan: 'Criar plano',
            new: 'Novo',
        },
        modal: {
            title: 'Novo plano de ginásio',
            subtitle: 'Escolhe como queres começar:',
            createNew: 'Criar novo',
            importFromFile: 'Importar de ficheiro',
            resumeDraft: 'Retomar rascunho',
            cancel: 'Cancelar',
        },
        import: {
            errors: {
                invalidExtension:
                    'Esse ficheiro não é um plano de ginásio ARC Timer (.arcgymplan).',
                invalidKind:
                    'Esse ficheiro não é uma exportação de plano de ginásio ARC Timer.',
                invalidShape:
                    'Esse ficheiro parece uma exportação ARC Timer, mas faltam dados.',
                parseFailed: 'O ficheiro está corrompido ou não é JSON válido.',
                readFailed: 'Não foi possível ler o ficheiro selecionado.',
                unexpected: 'A importação falhou devido a um erro inesperado.',
            },
        },
        confirmRemove: {
            title: 'Eliminar plano de ginásio?',
            message: 'Este plano de ginásio será eliminado permanentemente.',
            confirm: 'Eliminar',
        },
        confirmRemoveBulk: {
            title_one: 'Eliminar {{count}} plano de ginásio?',
            title_other: 'Eliminar {{count}} planos de ginásio?',
            message_one:
                'O plano de ginásio selecionado será eliminado permanentemente.',
            message_other:
                'Os {{count}} planos de ginásio selecionados serão eliminados permanentemente.',
        },
        card: {
            label: 'Plano',
            sections_one: '{{count}} secção',
            sections_other: '{{count}} secções',
            exercises_one: '{{count}} exercício',
            exercises_other: '{{count}} exercícios',
        },
    },
    gymPlanDetails: {
        title: 'Plano de ginásio',
        notFound: 'Plano de ginásio não encontrado',
        overview: 'Visão geral',
        cardTitle: 'Resumo do plano',
        sections: 'Secções',
        sectionFallback: 'Secção {{index}}',
        exerciseCount_one: '{{count}} exercício',
        exerciseCount_other: '{{count}} exercícios',
        exerciseFallback: 'Exercício',
        noTargets: 'Sem objetivos',
        favorite: 'Favorito',
        hint: 'Edita este plano ou inicia a tua sessão.',
        exportGymPlan: 'Exportar plano de ginásio',
        metrics: {
            sections: 'Secções',
            exercises: 'Exercícios',
            targetSets: 'Séries-alvo',
        },
        actions: {
            start: 'Iniciar plano',
            edit: 'Editar',
            favorite: 'Favorito',
            unfavorite: 'Remover favorito',
            archive: 'Arquivar',
            restore: 'Restaurar',
            delete: 'Eliminar',
        },
        targets: {
            sets_one: '{{count}} série',
            sets_other: '{{count}} séries',
            reps_one: '{{count}} repetição',
            reps_other: '{{count}} repetições',
            weightKg: '{{value}} kg',
            durationSec: '{{value}} seg',
        },
        deleteConfirm: {
            title: 'Eliminar plano de ginásio?',
            message: 'Este plano de ginásio será eliminado permanentemente.',
            confirm: 'Eliminar',
        },
        export: {
            sharingUnavailable:
                'A partilha não está disponível neste dispositivo.',
            writeFailed:
                'Não foi possível preparar este plano de ginásio para partilha.',
            failed: 'Não foi possível partilhar este plano de ginásio. Tenta novamente.',
        },
        errors: {
            actionFailed:
                'Não foi possível concluir esta ação. Tenta novamente.',
        },
    },
    gymPlanBuilder: {
        title: 'Novo plano',
        draftMissing: 'Nenhum rascunho de plano encontrado.',
        sectionFallback: 'Secção {{index}}',
        exerciseFallback: 'Exercício',
        exerciseCount_one: '{{count}} exercício',
        exerciseCount_other: '{{count}} exercícios',
        plannedSetCount_one: '{{count}} série planeada',
        plannedSetCount_other: '{{count}} séries planeadas',
        noTargets: 'Sem objetivos',
        sections: {
            details: 'Detalhes',
            plan: 'Plano de ginásio',
        },
        hints: {
            tapSectionToEdit: 'Toca numa secção para editar os detalhes.',
        },
        fields: {
            name: 'Nome do plano',
            namePlaceholder: 'ex.: Dia de perna',
            description: 'Descrição',
            descriptionPlaceholder: 'Notas opcionais para este plano',
            sectionTitle: 'Título da secção',
            targetWeightKg: 'Peso kg',
            notes: 'Notas',
        },
        actions: {
            addSection: 'Adicionar secção',
            addExercise: 'Adicionar exercício',
            addNote: 'Adicionar nota',
            removeNote: 'Remover nota',
            removeSection: 'Remover secção',
            save: 'Guardar',
            saveSection: 'Guardar',
        },
        exercisePicker: {
            title: 'Adicionar exercício',
            searchPlaceholder: 'Pesquisar exercícios de ginásio',
        },
        exerciseCard: {
            label: 'Exercício planeado',
        },
        targetFields: {
            description:
                'Escolhe que objetivos aparecem em cada exercício planeado. Repetições e peso vêm ativos por defeito.',
            removeDataAndSave: 'Remover objetivos e guardar',
            removeDataWarning:
                'Guardar vai remover objetivos existentes para: {{fields}}.',
            title: 'Campos registados',
        },
        sectionEditor: {
            exercises: 'Lista de exercícios',
            notFound: 'Secção do plano não encontrada.',
            tapExerciseToEdit: 'Toca num exercício para editar.',
            title: 'Detalhes da secção',
        },
        targets: {
            sets_one: '{{count}} série',
            sets_other: '{{count}} séries',
            reps_one: '{{count}} repetição',
            reps_other: '{{count}} repetições',
            weightKg: '{{value}} kg',
        },
        validation: {
            nameRequired: 'Nome do plano obrigatório.',
            sectionRequired: 'Adiciona pelo menos uma secção.',
            sectionExerciseRequired:
                'A secção {{index}} precisa de pelo menos um exercício.',
            saveFailed:
                'Não foi possível guardar este rascunho. Tenta novamente.',
        },
        discardConfirm: {
            title: 'Descartar rascunho?',
            message: 'Este rascunho de plano será eliminado.',
            confirm: 'Descartar',
        },
        removeSectionConfirm: {
            title: 'Remover secção?',
            message: 'Esta secção e os seus exercícios serão removidos.',
        },
        removeExerciseConfirm: {
            title: 'Remover exercício?',
            message: 'Este exercício será removido do plano.',
        },
    },
    gymPlanExerciseEdit: {
        title: 'Exercício planeado',
        notFound: 'Exercício planeado não encontrado.',
        exerciseName: 'Nome do exercício',
        exerciseNamePlaceholder: 'ex.: Leg Press',
        newExerciseTitle: 'Novo Exercício',
        exerciseFallback: 'Exercício',
        targets: 'Objetivos das séries',
        notes: 'Notas',
        hint: 'As alterações são guardadas automaticamente no rascunho.',
        errors: {
            nameRequired: exerciseNameRequired,
            saveFailed:
                'Não foi possível guardar este exercício. Tenta novamente.',
        },
    },
    gymActiveSession: {
        title: 'Sessão de ginásio',
        duration: 'Duração',
        startedAt: 'Iniciada',
        sets: 'Séries',
        exercises: 'Exercícios',
        emptyTitle: 'Sem sessão de ginásio ativa',
        noExercisesTitle: 'Ainda não existem exercícios',
        noExercisesDescription:
            'Adiciona exercícios à medida que avanças na sessão.',
        status: {
            complete: 'Concluído',
            inProgress: 'Em curso',
            live: 'Ao vivo',
        },
        sections: {
            addedExercises: 'Exercícios adicionados',
        },
        actions: {
            addExercise: 'Adicionar exercício',
            backToGym: 'Voltar ao ginásio',
            discard: 'Descartar',
            end: 'Terminar',
            finish: 'Terminar',
            removeExercise: 'Remover',
        },
        removeExerciseConfirm: {
            title: 'Remover exercício?',
            message:
                'Este exercício e todas as suas séries serão removidos da sessão.',
        },
        addExerciseModal: {
            create: 'Adicionar',
            name: 'Nome',
            namePlaceholder: 'ex.: Supino',
            nameRequired: exerciseNameRequired,
            subtitle: 'Seleciona um exercício existente ou adiciona um novo.',
            title: 'Adicionar exercício',
        },
        errors: {
            addExerciseFailed:
                'Não foi possível adicionar este exercício. Tenta novamente.',
            discardFailed:
                'Não foi possível descartar esta sessão. Tenta novamente.',
            finishFailed:
                'Não foi possível terminar esta sessão. Tenta novamente.',
            removeExerciseFailed:
                'Não foi possível remover este exercício. Tenta novamente.',
        },
    },
    gymHistory: {
        title: 'Histórico de ginásio',
        searchPlaceholder: 'Pesquisar sessões de ginásio',
        emptyTitle: 'Ainda não existem sessões de ginásio',
        emptyDescription: 'Conclui uma sessão de ginásio e ela aparecerá aqui.',
        searchEmptyTitle: 'Nenhuma sessão de ginásio encontrada',
        searchEmptyDescription: 'Experimenta outra data.',
        sessionTitle: 'Sessão de ginásio',
        confirmRemoveBulk: {
            title_one: 'Eliminar {{count}} sessão de ginásio?',
            title_other: 'Eliminar {{count}} sessões de ginásio?',
            message_one:
                'Isto irá eliminar permanentemente a sessão de ginásio selecionada.',
            message_other:
                'Isto irá eliminar permanentemente as {{count}} sessões de ginásio selecionadas.',
        },
    },
    gymSessionSummary: {
        title: 'Sessão de ginásio',
        notFound: 'Sessão de ginásio não encontrada',
        endedAt: 'Terminou {{time}}',
        completedSets: 'Séries concluídas',
        exercises: 'Exercícios',
        noExercises: 'Sem exercícios nesta sessão',
        notes: 'Notas',
        actions: {
            delete: 'Eliminar',
            openGymPlan: 'Ir para o plano',
            runAgain: 'Repetir',
        },
        hints: {
            noSourceGymPlan: 'Plano original não disponível.',
        },
        errors: {
            runAgainFailed: 'Não foi possível iniciar esta sessão novamente.',
        },
        status: {
            incomplete: 'Não terminada',
        },
        deleteConfirm: {
            title: 'Eliminar sessão de ginásio',
            message: 'Esta sessão de ginásio será eliminada permanentemente.',
            confirm: 'Eliminar',
        },
    },
    gymExerciseData: {
        title: 'Dados do exercício',
        exerciseSets: 'Séries do exercício',
        overview: 'Visão geral',
        exercise: 'Exercício',
        exerciseFallback: 'Exercício',
        sets: 'Séries',
        setWithIndex: 'Série {{index}}',
        newSet: 'Nova série',
        noSetsTitle: 'Ainda não existem séries',
        noSetsDescription:
            'Adiciona séries ou seleciona os campos a ser registados.',
        notFoundTitle: 'Exercício não encontrado',
        notFoundDescription:
            'Este exercício não está na sessão de ginásio ativa.',
        actions: {
            addSet: 'Adicionar série',
            backToSession: 'Voltar à sessão',
            completeSet: 'Concluir',
            deleteSet: 'Eliminar',
            options: 'Mais',
            saveSet: 'Guardar série',
            trackingFields: 'Campos registados',
        },
        fields: {
            distanceMeters: 'Distância',
            durationSec: 'Duração',
            reps: 'Repetições',
            weightKg: 'Peso',
        },
        fieldsByKey: {
            hasDistanceMeters: 'Distância',
            hasDurationSec: 'Duração',
            hasReps: 'Repetições',
            hasRpe: 'RPE',
            hasWeight: 'Peso',
        },
        defaults: {
            description:
                'Escolhe o que este exercício regista. Repetições e peso vêm ativos por defeito.',
            removeDataAndSave: 'Remover dados e guardar',
            removeDataWarning:
                'Guardar vai remover valores existentes para: {{fields}}.',
            title: 'Campos registados',
        },
        editSet: {
            description: 'Atualiza os valores registados nesta série.',
            title: 'Editar série',
        },
        status: {
            complete: 'Concluído',
            inProgress: 'Em curso',
        },
        deleteConfirm: {
            message: 'Esta série será eliminada permanentemente.',
            title: 'Eliminar série',
        },
        deleteConfirmBulk: {
            message: '{{count}} séries serão eliminadas permanentemente.',
            title: 'Eliminar {{count}} séries',
        },
        setDetails: {
            distance: '{{value}} km',
            duration: '{{value}}',
            empty: 'Sem dados da série',
            reps_one: '{{count}} repetição',
            reps_other: '{{count}} repetições',
            rpe: 'RPE {{value}}',
            weight: '{{value}} kg',
        },
        errors: {
            addSetFailed:
                'Não foi possível guardar esta série. Tenta novamente.',
            deleteSetFailed:
                'Não foi possível eliminar esta série. Tenta novamente.',
            updateSetFailed:
                'Não foi possível atualizar esta série. Tenta novamente.',
        },
    },
    history: {
        title: 'Histórico',
        searchPlaceholder: 'Pesquisar sessões',
        clear: 'Limpar',
        emptyTitle: 'Ainda não existem sessões',
        emptyDescription:
            'Conclui uma sessão HIIT ou de ginásio e ela aparecerá aqui.',
        filterEmptyTitle: 'Sem sessões neste filtro',
        filterEmptyDescription: 'Experimenta outro tipo de sessão.',
        searchEmptyTitle: 'Nenhuma sessão encontrada',
        searchEmptyDescription: 'Experimenta outro nome de sessão.',
        filters: {
            all: 'Todas',
            apply: 'Aplicar',
            clear: 'Limpar filtros',
            hiit: 'HIIT',
            gym: 'Ginásio',
            sessionType: 'Tipo de sessão:',
            title: 'Filtros',
        },
        kind: {
            hiit: 'HIIT',
            gym: 'Ginásio',
        },
        clearConfirm: {
            title: 'Limpar histórico',
            message: 'Todas as sessões serão eliminadas.',
            confirm: 'Limpar',
            cancel: 'Cancelar',
        },
        confirmRemoveBulk: {
            title_one: 'Eliminar {{count}} sessão',
            title_other: 'Eliminar {{count}} sessões',
            message_one: 'A sessão selecionada será eliminada permanentemente.',
            message_other:
                'As {{count}} sessões selecionadas serão eliminadas permanentemente.',
        },
    },
    historySession: {
        title: 'Sessão',
        notFound: 'Sessão não encontrada',
        workoutSessionFallback: 'Sessão de treino',
        endedAt: 'Terminou {{time}}',
        exercises: 'Exercícios',
        noExercises: 'Sem exercícios nesta sessão',
        blockStats: {
            sets: 'Séries:',
            exercises: 'Exercícios:',
            work: 'Trabalho:',
            rest: 'Descanso:',
        },
        actions: {
            openWorkout: 'Abrir treino',
            saveWorkout: 'Guardar treino',
            runAgain: 'Repetir treino',
            delete: 'Eliminar',
        },
        deleteConfirm: {
            title: 'Eliminar sessão',
            message: 'Esta sessão de treino será eliminada permanentemente.',
            confirm: 'Eliminar',
            cancel: 'Cancelar',
        },
        hints: {
            noSavedWorkout:
                'Nenhum treino guardado encontrado para esta sessão.',
            workoutEditedSinceSession:
                'O treino foi editado desde esta sessão.',
        },
    },
    workoutBlockItem: {
        summary: {
            timeEach: '{{value}}s cada',
            repsEach: '{{value}} repetições cada',
        },
        exerciseMeta: {
            time: '{{value}}s',
            reps_one: '{{count}} repetição',
            reps_other: '{{count}} repetições',
            rest: 'Descanso {{value}}s',
        },
        labels: {
            exerciseWithIndex: 'Exercício {{index}}',
        },
    },
    editWorkout: {
        title: {
            edit: 'Editar treino',
            create: 'Novo treino',
        },
        fields: {
            name: 'Nome',
            namePlaceholder: 'ex.: Condicionamento A',
        },
        defaults: {
            newWorkout: 'Novo treino',
        },
        sections: {
            blocks: 'Blocos',
        },
        hints: {
            tapBlockToEdit: 'Toca num bloco para editar os detalhes.',
        },
        actions: {
            addBlock: 'Adicionar bloco',
            cancel: 'Cancelar',
            save: 'Guardar',
            create: 'Criar',
        },
        validation: {
            nameRequired: 'Nome do treino obrigatório.',
            addBlock: 'Adiciona pelo menos um bloco.',
            exerciseNamesRequired: 'Nomes dos exercícios obrigatórios.',
            saveFailed:
                'Não foi possível guardar o treino. Verifica os detalhes e tenta novamente.',
            unnamedExercises: 'Nomes dos exercícios obrigatórios.',
        },
        removeBlock: {
            title: 'Remover bloco',
            message: 'Este bloco será removido permanentemente do treino.',
            confirm: 'Remover',
            cancel: 'Cancelar',
        },
    },
    editBlock: {
        title: {
            edit: 'Editar bloco',
            quick: 'Treino rápido',
        },
        notFound: 'Bloco não encontrado.',
        sections: {
            setup: 'Configuração do bloco',
            structure: 'Exercícios',
            timing: 'Descanso',
            exercises: 'Exercícios',
        },
        fields: {
            blockTitle: 'Nome do bloco',
            durationSec: 'Duração',
            exerciseDurationSec: 'Duração padrão',
            restBetweenExercisesSec: 'Entre exercícios',
            setsInBlock: 'Séries',
            restBetweenSetsSec: 'Entre séries',
        },
        units: {
            secondsShort: 's',
        },
        actions: {
            addExercise: 'Adicionar exercício',
            cancel: 'Cancelar',
            startWorkout: 'Iniciar treino',
            saveBlock: 'Guardar bloco',
        },
        removeExercise: {
            title: 'Remover exercício',
            message: 'Este exercício será removido do bloco.',
            confirm: 'Remover',
            cancel: 'Cancelar',
        },
        validation: {
            setsMin: 'Adiciona pelo menos uma série.',
            exercisesMin: 'Adiciona pelo menos um exercício.',
            exerciseNameRequired,
            exerciseDurationMin: 'Exercício {{index}}: duração > 0s.',
            exerciseRepsMin: 'Exercício {{index}}: repetições > 0.',
        },
    },
    settings: {
        title: 'Definições',
        sections: {
            appearance: 'Aparência',
            sound: 'Som',
            language: 'Idioma',
            about: 'Sobre',
        },
        descriptions: {
            theme: 'Seleciona o tema:',
            accent: 'Seleciona a cor do tom da aplicação:',
            sound: 'Ativa efeitos sonoros',
            language: 'Seleciona o idioma preferido:',
        },
        theme: {
            light: 'Claro',
            dark: 'Escuro',
            system: 'Sistema',
        },
        sound: {
            on: 'Ligado',
            off: 'Desligado',
        },
        languages: {
            en: 'Inglês',
            ptPT: 'Português (Portugal)',
        },
        accents: {
            classic: 'Clássico',
            violet: 'Violeta',
            cyan: 'Ciano',
            amber: 'Âmbar',
            neutral: 'Neutro',
        },
        about: {
            version: 'Versão {{version}}',
        },
    },
    workouts: {
        title: 'Treinos',
        searchPlaceholder: 'Pesquisar treinos',
        newButton: 'Novo',
        createButton: 'Criar treino',
        defaults: {
            quickWorkoutName: 'Treino rápido',
            quickBlockTitle: 'Bloco rápido',
        },
        emptyTitle: 'Ainda não existem treinos',
        emptyDescription: 'Cria o teu primeiro treino para começar.',
        searchEmptyTitle: 'Nenhum treino encontrado',
        searchEmptyDescription: 'Experimenta outro nome de treino.',
        item: {
            untitled: 'Treino sem nome',
        },
        confirmRemove: {
            title: 'Remover treino',
            message: 'Este treino será removido permanentemente.',
            confirm: 'Remover',
            cancel: 'Cancelar',
        },
        confirmRemoveBulk: {
            title_one: 'Remover {{count}} treino',
            title_other: 'Remover {{count}} treinos',
            message_one: 'O treino selecionado será removido permanentemente.',
            message_other:
                'Os {{count}} treinos selecionados serão removidos permanentemente.',
        },
        modal: {
            title: 'Novo treino',
            subtitle: 'Escolhe como queres começar:',
            createNew: 'Criar novo',
            importFromFile: 'Importar de ficheiro',
            cancel: 'Cancelar',
        },
        import: {
            errors: {
                invalidExtension:
                    'Esse ficheiro não é um treino ARC Timer (.arcw).',
                invalidKind:
                    'Esse ficheiro não é uma exportação de treino ARC Timer.',
                invalidShape:
                    'Esse ficheiro parece uma exportação ARC Timer, mas faltam dados.',
                parseFailed: 'O ficheiro está corrompido ou não é JSON válido.',
                readFailed: 'Não foi possível ler o ficheiro selecionado.',
                unexpected: 'A importação falhou devido a um erro inesperado.',
            },
        },
    },
    exerciseDefinitions: {
        title: 'Exercícios',
        detailsTitle: 'Exercício',
        searchPlaceholder: 'Pesquisar exercícios',
        newButton: 'Novo',
        createButton: 'Criar exercício',
        emptyTitle: 'Ainda não existem exercícios',
        emptyDescription:
            'Cria o teu primeiro exercício para construir o catálogo.',
        searchEmptyTitle: 'Nenhum exercício encontrado',
        searchEmptyDescription: 'Experimenta outro nome de exercício.',
        notFound: 'Exercício não encontrado.',
        overview: 'Visão geral',
        defaults: 'Campos predefinidos',
        statsTitle: 'Estatísticas do exercício',
        notes: 'Notas',
        emptyValue: 'Sem valor',
        emptyDefaultsTitle: 'Sem campos predefinidos',
        emptyDefaultsDescription:
            'Escolhe os campos com que este exercício deve começar.',
        emptyStatsTitle: 'Sem estatísticas',
        emptyStatsDescription: 'Completa sessões para criar recordes pessoais.',
        emptyRecentSessionsTitle: 'Sem sessões recentes',
        emptyRecentSessionsDescription:
            'As sessões concluídas com este exercício aparecem aqui.',
        fields: {
            name: 'Nome',
            namePlaceholder: 'ex.: Flexões',
            availability: 'Disponibilidade',
            source: 'Origem',
            trackingFields: 'Campos predefinidos',
            defaultReps: 'Repetições predefinidas',
            defaultWeight: 'Peso predefinido',
            defaultDuration: 'Duração predefinida',
            defaultDistance: 'Distância predefinida',
            defaultRpe: 'RPE predefinido',
            weightPr: 'Recorde de peso',
            distancePr: 'Recorde de distância',
            lastCompletedSession: 'Última sessão',
            recentSessions: 'Sessões recentes',
        },
        trackingField: {
            reps: 'Repetições',
            weight: 'Peso',
            duration: 'Duração',
            distance: 'Distância',
            rpe: 'RPE',
        },
        source: {
            system: 'Sistema',
            user: 'Personalizado',
        },
        availability: {
            both: 'Treino + ginásio',
            workout: 'Treino',
            gym: 'Ginásio',
        },
        modal: {
            createTitle: 'Novo exercício',
            editTitle: 'Editar exercício',
            subtitle: 'Adicionar exercício ao teu catálogo.',
            create: 'Criar',
            save: 'Guardar',
        },
        trackingModal: {
            title: 'Predefinições de registo',
            subtitle:
                'Escolhe os campos que este exercício deve registar por defeito.',
            removeDefaultAndSave: 'Remover valores e guardar',
            removeDefaultWarning:
                'Guardar vai limpar os valores predefinidos para: {{fields}}.',
        },
        defaultValueModal: {
            title: 'Definir {{field}}',
            description:
                'Deixa em branco quando não houver um valor predefinido.',
        },
        nameModal: {
            title: 'Editar nome',
            description: 'Renomeia este exercício no teu catálogo.',
        },
        availabilityModal: {
            title: 'Editar disponibilidade',
            description: 'Escolhe onde este exercício pode ser usado.',
        },
        references: {
            title: 'Referências',
            workout: 'Treino',
            gymPlan: 'Plano de ginásio',
        },
        confirmRemove: {
            title: 'Apagar exercício?',
            message:
                'Este exercício será removido se ainda não estiver a ser usado.',
            confirm: 'Apagar exercício',
        },
        confirmRemoveBulk: {
            title_one: 'Apagar {{count}} exercício?',
            title_other: 'Apagar {{count}} exercícios?',
            message_one:
                'O exercício selecionado será removido se ainda não estiver a ser usado.',
            message_other:
                'Os exercícios selecionados serão removidos se ainda não estiverem a ser usados.',
        },
        deleteUnavailable: {
            title: 'O exercício não pode ser selecionado',
            referenced:
                'Este exercício é usado em treinos, planos de ginásio ou histórico de ginásio, por isso não pode ser apagado.',
            system: 'Os exercícios do sistema vêm incluídos na app e não podem ser apagados.',
        },
        validation: {
            nameRequired: exerciseNameRequired,
            duplicateName: 'Já existe um exercício com este nome.',
            deleteReferenced:
                'Este exercício ainda está a ser usado e não pode ser apagado.',
            deleteSystemForbidden:
                'Os exercícios do sistema não podem ser apagados.',
            gymOnlyRestricted:
                'Este exercício está a ser usado num treino e não pode ser definido apenas para ginásio.',
            mergeGymOnlyConflict:
                'Um exercício de treino não pode ser unido a um exercício apenas de ginásio.',
            mergeWorkoutOnlyConflict:
                'Um exercício de ginásio não pode ser unido a um exercício apenas de treino.',
            workoutOnlyRestricted:
                'Este exercício está a ser usado num plano de ginásio e não pode ser definido apenas para treino.',
            saveFailed:
                'Não foi possível guardar o exercício. Verifica os detalhes e tenta novamente.',
            deleteFailed: 'Não foi possível apagar o exercício.',
        },
    },
    workoutSummary: {
        title: 'Treino',
        notFound: 'Treino não encontrado.',
        overview: 'Visão geral',
        favorite: 'Favorito',
        cardTitle: 'Resumo do treino',
        metrics: {
            blocks: 'Blocos',
            exercises: 'Exercícios',
            estimatedTime: 'Tempo estimado',
        },
        blocksSection: 'Blocos',
        hint: 'Edita este treino ou inicia a tua sessão.',
        exportWorkout: 'Exportar treino',
        actions: {
            edit: 'Editar',
            start: 'Iniciar',
        },
        export: {
            sharingUnavailable:
                'A partilha não está disponível neste dispositivo.',
            writeFailed: 'Não foi possível preparar o ficheiro para partilha.',
            failed: 'Falha ao exportar treino.',
        },
    },
    run: {
        title: 'Executar treino',
        emptyTitle: 'Sem passos para executar',
        emptyDescription:
            'Este treino não tem passos temporizados configurados.',
        donePill: 'Concluído',
        phase: {
            work: 'Trabalho',
            setRest: 'Descanso da série',
            rest: 'Descanso',
            prepare: 'Preparar',
        },
        top: {
            blocks: 'Blocos',
            exercises: 'Exercícios',
            completeTitle: 'Treino concluído',
        },
        section: {
            nextBlock: 'Próximo bloco:',
            exercise: 'Exercício',
            next: 'Próximo',
        },
        confirmEnd: {
            title: 'Terminar treino?',
            message: 'O teu progresso será guardado.',
            confirm: 'Terminar treino',
            cancel: 'Continuar',
        },
        actions: {
            backToHome: 'Voltar ao início',
            holdToStartBlock: 'Manter pressionado para iniciar bloco',
            end: 'Terminar',
            skip: 'Saltar',
            start: 'Iniciar',
            pause: 'Pausar',
            resume: 'Retomar',
            continue: 'Continuar',
            done: 'Concluído',
        },
        stats: {
            title: 'Estatísticas da sessão',
            duration: 'Duração',
            sets: 'Séries',
            exercises: 'Exercícios',
            workTime: 'Tempo de trabalho',
            restTime: 'Tempo de descanso',
            pausedTime: 'Tempo em pausa',
        },
        shareCard: {
            title: 'Treino concluído',
        },
    },
};
