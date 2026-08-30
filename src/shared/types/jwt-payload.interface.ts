export interface JwtPayload {
    readonly sub: string;
    readonly email: string;
    readonly role: string;
    readonly iss: string;
    readonly aud: string;
    readonly jti: string;
}
