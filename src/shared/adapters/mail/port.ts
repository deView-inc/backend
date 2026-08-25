export interface IMailPort {
    sendCodeForSignUp(email: string, name: string, code: string): Promise<void>;
    sendCodeForSignIn(email: string, name: string, code: string): Promise<void>;
}
