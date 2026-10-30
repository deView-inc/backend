// Сложность и языки общие с комнатами, чтобы задачу можно было подобрать под комнату
export {
    ROOM_DIFFICULTIES as TASK_DIFFICULTIES,
    ROOM_LANGUAGES as TASK_LANGUAGES,
} from '@core/rooms/domain/enums';

export const TASK_VISIBILITIES = ['private', 'public'] as const;
export type TaskVisibility = (typeof TASK_VISIBILITIES)[number];

/** All: типовые + сообщество, official: типовые, community: сообщество, mine: мои (и личные, и публичные) */
export const TASK_SCOPES = ['all', 'official', 'community', 'mine'] as const;
export type TaskScope = (typeof TASK_SCOPES)[number];

export const TASK_REPORT_REASONS = [
    'spam',
    'offensive',
    'incorrect',
    'copyright',
    'other',
] as const;
export type TaskReportReason = (typeof TASK_REPORT_REASONS)[number];

/** Сколько жалоб скрывают публичную задачу из общей библиотеки (до проверки модератором) */
export const REPORTS_HIDE_THRESHOLD = 5;
