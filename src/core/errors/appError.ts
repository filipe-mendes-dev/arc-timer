import type { I18nKey } from 'src/i18n/i18nKey';

export interface AppError<TCode extends string> extends Error {
    readonly code: TCode;
}

export interface AppErrorDefinition<TCode extends string> {
    readonly code: TCode;
    readonly message: I18nKey;
}

interface ErrorCodeCandidate {
    readonly code?: unknown;
}

export const isAppErrorCode = <TCode extends string>(
    error: unknown,
    codes: readonly TCode[],
): error is AppError<TCode> => {
    if (!(error instanceof Error)) return false;

    const candidate = error as ErrorCodeCandidate;

    return (
        typeof candidate.code === 'string' &&
        codes.includes(candidate.code as TCode)
    );
};
