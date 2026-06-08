import { useTranslation } from 'react-i18next';

import type {
    ExerciseDefinitionReferenceItem,
    ExerciseDefinitionReferences,
} from '@src/core/entities/exerciseDefinition.interfaces';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';

import { ExerciseDefinitionReferenceRow } from './ExerciseDefinitionReferenceRow';

interface ExerciseDefinitionReferencesSectionProps {
    references?: ExerciseDefinitionReferences;
    onPressReference: (reference: ExerciseDefinitionReferenceItem) => void;
}

export const ExerciseDefinitionReferencesSection = ({
    onPressReference,
    references,
}: ExerciseDefinitionReferencesSectionProps) => {
    const { t } = useTranslation();
    const items = references?.items ?? [];

    if (items.length === 0) return null;

    return (
        <ScreenSection
            title={t('exerciseDefinitions.references.title')}
            topSpacing="medium"
        >
            {items.map((item) => (
                <ExerciseDefinitionReferenceRow
                    key={`${item.kind}:${item.id}`}
                    reference={item}
                    onPress={() => onPressReference(item)}
                />
            ))}
        </ScreenSection>
    );
};
