export const UserErrorCodes = {
    QUERY_PARAMS_MISSING: 'USER.QUERY_PARAMS_MISSING',
    PRONOUNS_CUSTOM_REQUIRED: 'USER.PRONOUNS_CUSTOM_REQUIRED',
    PRONOUNS_CUSTOM_TOO_LONG: 'USER.PRONOUNS_CUSTOM_TOO_LONG',
    NOT_FOUND: 'USER.NOT_FOUND',
    ALREADY_EXISTS: 'USER.ALREADY_EXISTS',
    EMAIL_ALREADY_EXISTS: 'USER.EMAIL_ALREADY_EXISTS',
    DATA_CORRUPTION: 'USER.DATA_CORRUPTION',
    CREATE_FAILED: 'USER.CREATE_FAILED',
    UPDATE_FAILED: 'USER.UPDATE_FAILED',
    DELETE_FAILED: 'USER.DELETE_FAILED',
} as const;

export type UserErrorCode = (typeof UserErrorCodes)[keyof typeof UserErrorCodes];

export const UserErrorMessages: Record<UserErrorCode, string> = {
    [UserErrorCodes.QUERY_PARAMS_MISSING]: 'Не указаны параметры поиска пользователя',
    [UserErrorCodes.PRONOUNS_CUSTOM_REQUIRED]: 'Пожалуйста, укажите пользовательские местоимения',
    [UserErrorCodes.PRONOUNS_CUSTOM_TOO_LONG]:
        'Пользовательские местоимения не могут превышать 50 символов',
    [UserErrorCodes.NOT_FOUND]: 'Пользователь не найден',
    [UserErrorCodes.ALREADY_EXISTS]: 'Пользователь уже существует',
    [UserErrorCodes.EMAIL_ALREADY_EXISTS]: 'Пользователь с таким email уже существует',
    [UserErrorCodes.DATA_CORRUPTION]: 'Ошибка целостности данных пользователя',
    [UserErrorCodes.CREATE_FAILED]: 'Не удалось создать пользователя',
    [UserErrorCodes.UPDATE_FAILED]: 'Не удалось обновить данные пользователя',
    [UserErrorCodes.DELETE_FAILED]: 'Не удалось удалить пользователя',
};
