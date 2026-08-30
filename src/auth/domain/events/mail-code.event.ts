export class MailCodeEvent {
    constructor(
        public readonly email: string,
        public readonly otp: string,
    ) {}
}
