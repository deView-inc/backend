export const OAuthErrorCodes = {
    INVALID_ACTION: 'OAUTH.INVALID_ACTION',
    INVALID_PROVIDER: 'OAUTH.INVALID_PROVIDER',
    PROVIDER_NOT_CONFIGURED: 'OAUTH.PROVIDER_NOT_CONFIGURED',
    PROVIDER_NOT_LINKED: 'OAUTH.PROVIDER_NOT_LINKED',
    PROVIDER_ALREADY_CONNECTED: 'OAUTH.PROVIDER_ALREADY_CONNECTED',
    PROVIDER_MISMATCH: 'OAUTH.PROVIDER_MISMATCH',
    INVALID_OR_EXPIRED_STATE: 'OAUTH.INVALID_OR_EXPIRED_STATE',
    STATE_MISMATCH: 'OAUTH.STATE_MISMATCH',
    LAST_AUTH_METHOD_CANNOT_BE_REMOVED: 'OAUTH.LAST_AUTH_METHOD_CANNOT_BE_REMOVED',
    EXCHANGE_TOKEN_INVALID: 'OAUTH.EXCHANGE_TOKEN_INVALID',
    PROVIDER_ALREADY_USED: 'OAUTH.PROVIDER_ALREADY_USED',
    EMAIL_ALREADY_EXISTS: 'OAUTH.EMAIL_ALREADY_EXISTS',
    ACTIVE_OAUTH_SESSION_EXISTS: 'OAUTH.ACTIVE_SESSION_EXISTS',
    DATA_CORRUPTION: 'OAUTH.DATA_CORRUPTION',
    SESSION_CREATION_FAILED: 'OAUTH.SESSION_CREATION_FAILED',
    AUTHENTICATION_FAILED: 'OAUTH.AUTHENTICATION_FAILED',
    INVALID_PROVIDER_PROFILE: 'OAUTH.INVALID_PROVIDER_PROFILE',
    EMAIL_NOT_VERIFIED: 'OAUTH.EMAIL_NOT_VERIFIED',
} as const;

export type OAuthErrorCode = (typeof OAuthErrorCodes)[keyof typeof OAuthErrorCodes];

export const OAuthErrorMessages: Record<OAuthErrorCode, string> = {
    [OAuthErrorCodes.INVALID_ACTION]: 'Неверное действие для OAuth операции',
    [OAuthErrorCodes.INVALID_PROVIDER]: 'Указанный OAuth провайдер не поддерживается',
    [OAuthErrorCodes.PROVIDER_NOT_CONFIGURED]: 'Указанный OAuth провайдер не настроен на сервере',
    [OAuthErrorCodes.PROVIDER_NOT_LINKED]: 'Провайдер не привязан к пользователю',
    [OAuthErrorCodes.PROVIDER_ALREADY_CONNECTED]: 'Провайдер уже подключен к аккаунту',
    [OAuthErrorCodes.PROVIDER_MISMATCH]: 'Провайдер в запросе не совпадает с ожидаемым',
    [OAuthErrorCodes.INVALID_OR_EXPIRED_STATE]: 'Сессия подключения недействительна или истекла',
    [OAuthErrorCodes.STATE_MISMATCH]:
        'Не удалось подтвердить подлинность запроса авторизации (state не совпадает). Попробуйте войти ещё раз',
    [OAuthErrorCodes.LAST_AUTH_METHOD_CANNOT_BE_REMOVED]:
        'Нельзя удалить последний способ входа. Обновите адрес електронной почты или добавьте другой провайдер',
    [OAuthErrorCodes.EXCHANGE_TOKEN_INVALID]: 'Токен обмена недействителен или истёк',
    [OAuthErrorCodes.PROVIDER_ALREADY_USED]: 'Провайдер уже привязан к другому пользователю',
    [OAuthErrorCodes.EMAIL_ALREADY_EXISTS]: 'Пользователь с таким email уже существует',
    [OAuthErrorCodes.ACTIVE_OAUTH_SESSION_EXISTS]: 'Активный процесс авторизации уже существует',
    [OAuthErrorCodes.DATA_CORRUPTION]: 'Ошибка целостности данных',
    [OAuthErrorCodes.SESSION_CREATION_FAILED]: 'Не удалось создать сессию',
    [OAuthErrorCodes.AUTHENTICATION_FAILED]: 'Ошибка авторизации через внешний сервис',
    [OAuthErrorCodes.INVALID_PROVIDER_PROFILE]:
        'Провайдер вернул неполные или некорректные данные профиля',
    [OAuthErrorCodes.EMAIL_NOT_VERIFIED]: 'Email не подтвержден в аккаунте Google',
};
