import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from '@shared/types';

@Injectable()
export class TokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly cfg: ConfigService,
    ) {}

    async generateTokens(user: { id: string; email: string }, sessionId: string) {
        const issuer = this.cfg.getOrThrow('JWT_ISSUER');
        const audience = this.cfg.getOrThrow('JWT_AUDIENCE');

        const now = Math.floor(Date.now() / 1000);

        const payload = {
            email: user.email,
        };

        const sharedPayload = {
            issuer,
            audience,
            notBefore: 0,
        };

        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const accessExp = this.cfg.get<any>('JWT_ACCESS_EXPIRES_IN');
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const refreshExp = this.cfg.get<any>('JWT_REFRESH_EXPIRES_IN');

        const [access, refresh] = await Promise.all([
            this.jwtService.signAsync(payload, {
                ...sharedPayload,
                secret: this.cfg.get('JWT_ACCESS_SECRET'),
                subject: user.id,
                expiresIn: accessExp,
                jwtid: `${sessionId}_access_${now}`,
            }),
            this.jwtService.signAsync(payload, {
                ...sharedPayload,
                jwtid: sessionId,
                subject: user.id,
                secret: this.cfg.get('JWT_REFRESH_SECRET'),
                expiresIn: refreshExp,
            }),
        ]);

        const refreshDecodedData = this.jwtService.decode(refresh);

        return { access, refresh, expiresAt: new Date(refreshDecodedData?.exp * 1000) };
    }

    async validateToken(token: string, type: 'access' | 'refresh'): Promise<JwtPayload | null> {
        try {
            const accessSecret = this.cfg.get('JWT_ACCESS_SECRET');
            const refreshSecret = this.cfg.get('JWT_REFRESH_SECRET');
            const audience = this.cfg.get('JWT_AUDIENCE');
            const issuer = this.cfg.get('JWT_ISSUER');

            const secret = type === 'access' ? accessSecret : refreshSecret;

            return this.jwtService.verifyAsync<JwtPayload>(token, {
                secret,
                issuer,
                audience,
                clockTolerance: 30,
            });
        } catch {
            return null;
        }
    }
}
