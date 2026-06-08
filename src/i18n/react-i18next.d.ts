import 'i18next';

import type { I18nResource } from './resources/interfaces';

declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'translation';
        returnNull: false;
        resources: {
            translation: I18nResource;
        };
    }
}
