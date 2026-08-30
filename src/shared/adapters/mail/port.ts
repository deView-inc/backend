import { SessionSelect } from '@core/auth/domain/repository';

export interface IMailPort {
    sendCodeForSignUp(email: string, code: string): Promise<void>;
    sendCodeForSignIn(email: string, code: string): Promise<void>;
    sendCurrentSession(
        email: string,
        session: Pick<
            SessionSelect,
            'city' | 'country' | 'deviceType' | 'browser' | 'createdAt' | 'os'
        >,
    ): Promise<void>;
}
