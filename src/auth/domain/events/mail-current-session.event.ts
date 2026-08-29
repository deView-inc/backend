import { SessionEmail } from '@core/auth/application/interfaces/session-email.type';

export class MailCurrentSessionEvent {
    constructor(
        public readonly email: string,
        public readonly session: SessionEmail,
    ) {}
}
