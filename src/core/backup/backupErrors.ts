export type BackupErrorCode =
    | 'INVALID_EXTENSION'
    | 'INVALID_JSON'
    | 'INVALID_KIND'
    | 'INVALID_DATA'
    | 'UNSUPPORTED_FORMAT'
    | 'UNSUPPORTED_SCHEMA'
    | 'ACTIVE_SESSION'
    | 'READ_FAILED'
    | 'WRITE_FAILED'
    | 'SHARING_UNAVAILABLE'
    | 'SHARE_FAILED'
    | 'RESTORE_FAILED';

export class BackupError extends Error {
    constructor(public readonly code: BackupErrorCode) {
        super(code);
        this.name = 'BackupError';
    }
}
