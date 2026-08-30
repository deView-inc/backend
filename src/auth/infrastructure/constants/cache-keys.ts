export const SIGNUP_CACHE_KEY = (email: string) => `reg:${email}`;
export const SIGNIN_CACHE_KEY = (email: string) => `login:${email}`;
export const RESET_PASSWORD_CACHE_KEY = (email: string) => `pass:reset:${email}`;

export const RESEND_COOLDOWN_KEY = (context: string, email: string) =>
    `resend:cooldown:${context}:${email}`;
export const RESEND_ATTEMPTS_KEY = (context: string, email: string) =>
    `resend:attempts:${context}:${email}`;

export const EMAIL_CODE_TTL_SECONDS = 900;
export const MAX_ATTEMPTS = 5;
export const SECONDS_BETWEEN_ATTEMPTS = 60;

export const EXCHANGE_TOKEN_TTL = 10 * 60; // 10 минут
export const EXCHANGE_TOKEN_NAME = (token: string) => `oauth:exchange:${token}`;
