import type { I18nResource } from './interfaces';

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
        quickWorkout: 'Treino rápido',
        startImmediately: 'Começar imediatamente',
        recentWorkouts: 'Treinos recentes',
        noSessionsYet: 'Ainda não existem sessões.',
    },
    gym: {
        title: 'Ginásio',
        heading: 'Sessão de ginásio',
        subtitle: 'Regista trabalho de força fora dos treinos temporizados.',
        currentSession: 'Sessão atual',
        sessionStats: 'Dados da sessão',
        actions: {
            startNewSession: 'Sessão rápida',
            startNewSessionSubtitle:
                'Começar a partir de um registo de ginásio vazio',
            resumeSession: 'Retomar sessão',
            finishSession: 'Terminar sessão',
            history: 'Histórico de sessões',
            historySubtitle: 'Revê sessões de ginásio concluídas',
            plans: 'Planos de ginásio',
            plansSubtitle: 'Cria modelos de força reutilizáveis',
            sessionInProgress: 'Sessão em curso',
            sessionInProgressSubtitle: 'Termina-a antes de iniciar outra',
        },
        finishSessionModal: {
            title: 'Terminar sessão?',
            message:
                'Conclui esta sessão para a guardar no histórico, ou descarta-a sem manter progresso.',
            complete: 'Concluir',
            discard: 'Descartar',
        },
        status: {
            active: 'Já existe uma sessão de ginásio ativa.',
            none: 'Sem sessão de ginásio ativa.',
        },
        errors: {
            activeSessionExists: 'Já existe uma sessão de ginásio ativa.',
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
            createPlan: '+ Criar plano',
            new: '+ Novo',
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
        hint: 'Podes iniciar este plano agora ou editá-lo antes da próxima sessão.',
        exportGymPlan: 'Partilhar plano de ginásio',
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
            failed:
                'Não foi possível partilhar este plano de ginásio. Tenta novamente.',
        },
        errors: {
            actionFailed:
                'Não foi possível concluir esta ação. Tenta novamente.',
        },
    },
    gymPlanBuilder: {
        title: 'Novo Plano',
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
            namePlaceholder: 'ex.: Dia de empurrar',
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
            nameRequired: 'O nome do plano é obrigatório.',
            sectionRequired: 'Adiciona pelo menos uma secção.',
            sectionExerciseRequired:
                'A secção {{index}} precisa de pelo menos um exercício.',
            placeholderExerciseRequired:
                'Escolhe um exercício para cada item na secção {{index}}.',
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
            nameRequired: 'O nome do exercício é obrigatório.',
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
        emptyDescription:
            'Inicia uma sessão de ginásio antes de registar exercícios.',
        noExercisesTitle: 'Ainda não existem exercícios',
        noExercisesDescription:
            'Adiciona exercícios aqui à medida que avanças na sessão.',
        status: {
            complete: 'Concluído',
            inProgress: 'Em curso',
            live: 'Ao vivo',
        },
        actions: {
            addExercise: 'Adicionar exercício',
            backToGym: 'Voltar ao Ginásio',
            discard: 'Descartar',
            end: 'Terminar',
            finish: 'Terminar',
            removeExercise: 'Remover',
        },
        finishConfirm: {
            title: 'Terminar sessão?',
            message: 'Isto vai guardar a sessão de ginásio no histórico.',
        },
        discardConfirm: {
            title: 'Descartar sessão?',
            message:
                'Esta sessão de ginásio será fechada sem manter progresso.',
        },
        removeExerciseConfirm: {
            title: 'Remover exercício?',
            message:
                'Este exercício e todas as suas séries serão removidos da sessão.',
        },
        addExerciseModal: {
            create: 'Criar',
            name: 'Nome',
            namePlaceholder: 'ex.: Supino',
            nameRequired: 'O nome do exercício é obrigatório.',
            subtitle: 'Usa um exercício guardado ou escreve um novo.',
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
            noSourceGymPlan:
                'O plano original não está disponível. Repetir irá recriar a estrutura desta sessão.',
        },
        errors: {
            runAgainFailed:
                'Não foi possível iniciar esta sessão novamente.',
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
            'Adiciona dados quando a série tiver repetições, peso, tempo ou distância.',
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
        searchPlaceholder: 'Pesquisar treinos',
        clear: 'Limpar',
        emptyTitle: 'Ainda não existem sessões',
        emptyDescription: 'Executa um treino e ele aparecerá aqui.',
        searchEmptyTitle: 'Nenhuma sessão encontrada',
        searchEmptyDescription: 'Experimenta outro nome de treino.',
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
        byBlock: 'Por bloco',
        noCompletedBlocks: 'Sem blocos concluídos nesta sessão',
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
            addBlock: '＋ Adicionar bloco',
            cancel: 'Cancelar',
            save: 'Guardar',
            create: 'Criar',
        },
        validation: {
            nameRequired: 'O nome do treino é obrigatório.',
            addBlock: 'Adiciona pelo menos um bloco.',
            exerciseNamesRequired: 'Exercícios devem ter nomes definidos.',
            saveFailed:
                'Não foi possível guardar o treino. Verifica os detalhes e tenta novamente.',
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
            addExercise: '＋ Adicionar exercício',
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
            setsMin: 'O bloco tem de ter pelo menos uma série.',
            exercisesMin: 'Adiciona pelo menos um exercício.',
            exerciseNameRequired:
                'O nome do exercício é obrigatório antes de guardar.',
            exerciseDurationMin:
                'Exercício {{index}}: a duração tem de ser > 0 segundos.',
            exerciseRepsMin:
                'Exercício {{index}}: as repetições têm de ser > 0.',
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
            theme: 'Seleciona o tema preferido',
            accent: 'Seleciona a cor de destaque preferida',
            sound: 'Ativa efeitos sonoros',
            language: 'Seleciona o idioma preferido',
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
        newButton: '＋ Novo',
        createButton: '＋ Criar treino',
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
        newButton: '＋ Novo',
        createButton: '＋ Criar exercício',
        emptyTitle: 'Ainda não existem exercícios',
        emptyDescription:
            'Cria o teu primeiro exercício para construir o catálogo.',
        searchEmptyTitle: 'Nenhum exercício encontrado',
        searchEmptyDescription: 'Experimenta outro nome de exercício.',
        notFound: 'Exercício não encontrado.',
        overview: 'Visão geral',
        fields: {
            name: 'Nome',
            namePlaceholder: 'ex.: Flexões',
            availability: 'Disponibilidade',
            source: 'Origem',
        },
        source: {
            system: 'Sistema',
            user: 'Personalizado',
        },
        availability: {
            both: 'Treino + Ginásio',
            workout: 'Treino',
            gym: 'Ginásio',
        },
        modal: {
            createTitle: 'Novo exercício',
            editTitle: 'Editar exercício',
            subtitle: 'Mantém o catálogo de exercícios claro e reutilizável.',
            create: 'Criar',
            save: 'Guardar',
        },
        validation: {
            nameRequired: 'O nome do exercício é obrigatório.',
            duplicateName: 'Já existe um exercício com este nome.',
            gymOnlyRestricted:
                'Este exercício está a ser usado num treino e não pode ser definido apenas para ginásio.',
            workoutOnlyRestricted:
                'Este exercício está a ser usado num plano de ginásio e não pode ser definido apenas para treino.',
            saveFailed:
                'Não foi possível guardar o exercício. Verifica os detalhes e tenta novamente.',
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
        hint: 'Podes editar este treino ou iniciá-lo agora.',
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
            message: 'O teu progresso será guardado no resumo.',
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
