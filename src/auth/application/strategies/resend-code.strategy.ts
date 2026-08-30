import { AuthMailJobs } from '@core/auth/domain/enums';
import { AuthErrorCodes, AuthErrorMessages } from '@core/auth/domain/errors';
import { MailCodeEvent } from '@core/auth/domain/events';
import { SIGNIN_CACHE_KEY, SIGNUP_CACHE_KEY } from '@core/auth/infrastructure/constants';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ResendCodeDto } from '../dtos';

interface ResendConfig {
    cacheKey: (email: string) => string;
    job: AuthMailJobs;
    event: (email: string, token: string) => object;
    successMessage: string;
    cacheNotFoundMessage: string;
    cacheNotFoundCode: string;
}

export const RESEND_CONFIGS: Record<ResendCodeDto['context'], ResendConfig> = {
    'sign-up': {
        cacheKey: SIGNUP_CACHE_KEY,
        job: AuthMailJobs.SEND_REGISTER_CODE,
        event: (email, token) => new MailCodeEvent(email, token),
        successMessage: 'Повторный код подтверждения отправлен на вашу почту',
        cacheNotFoundMessage: AuthErrorMessages[AuthErrorCodes.RESET_SESSION_EXPIRED],
        cacheNotFoundCode: AuthErrorCodes.RESET_SESSION_EXPIRED,
    },
    'sign-in': {
        cacheKey: SIGNIN_CACHE_KEY,
        job: AuthMailJobs.SEND_LOGIN_CODE,
        event: (email, token) => new MailCodeEvent(email, token),
        successMessage: 'Повторный код отправлен на вашу почту',
        cacheNotFoundMessage: AuthErrorMessages[AuthErrorCodes.RESET_SESSION_EXPIRED],
        cacheNotFoundCode: AuthErrorCodes.RESET_SESSION_EXPIRED,
    },
};
