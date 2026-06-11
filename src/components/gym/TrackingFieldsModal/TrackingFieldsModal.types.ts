import type { I18nKey } from '@src/i18n/i18nKey';

export type { TrackingFieldsValue } from '@src/core/entities/exerciseTrackingFields';

export interface TrackingFieldsModalCopy {
    description: I18nKey;
    removeDataAndSave: I18nKey;
    removeDataWarning: I18nKey;
    title: I18nKey;
}
