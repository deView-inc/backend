import crypto from 'node:crypto';

import { OAuthErrorCodes, OAuthErrorMessages } from '@core/auth/domain/errors';
import {
    assertOAuthProvider,
    isOAuthProviderConfigured,
    OAUTH_CSRF_COOKIE_NAME,
    OAUTH_CSRF_COOKIE_TTL_SECONDS,
    OAuthProvider,
} from '@core/auth/infrastructure/constants';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard, IAuthGuard } from '@nestjs/passport';
import { BaseException } from '@shared/error';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { firstValueFrom, isObservable } from 'rxjs';

interface OAuthQuery {
    code?: string;
    state?: string;
    error?: string;
}
type OAuthRequest = FastifyRequest<{ Params: { provider?: string }; Querystring: OAuthQuery }>;

interface OAuthStatePayload {
    readonly nonce: string;
    readonly connect?: string;
}

const STRATEGY_NAME: Record<OAuthProvider, string> = {
    [OAuthProvider.GOOGLE]: 'google-oauth',
    [OAuthProvider.GITHUB]: 'github-oauth',
};

@Injectable()
export class OAuthGuard implements CanActivate {
    private readonly guardClasses: Record<OAuthProvider, new (options: unknown) => IAuthGuard> = {
        [OAuthProvider.GOOGLE]: AuthGuard(STRATEGY_NAME[OAuthProvider.GOOGLE]),
        [OAuthProvider.GITHUB]: AuthGuard(STRATEGY_NAME[OAuthProvider.GITHUB]),
    };

    constructor(private readonly cfg: ConfigService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<OAuthRequest>();
        const response = context.switchToHttp().getResponse<FastifyReply>();
        const provider = assertOAuthProvider(request.params.provider ?? '');

        if (!isOAuthProviderConfigured(provider, this.cfg)) {
            const url = this.handleError(
                OAuthErrorCodes.PROVIDER_NOT_CONFIGURED,
                OAuthErrorMessages[OAuthErrorCodes.PROVIDER_NOT_CONFIGURED],
            );
            response.redirect(url, 302);

            return false;
        }

        const isCallback = Boolean(request.query.code || request.query.error);

        let state: string | undefined;

        if (isCallback) {
            const verified = this.verifyCsrfState(request, response);
            if (verified === false) {
                return false;
            }
            state = verified;

            if (request.query.error) {
                const url = this.handleError(
                    OAuthErrorCodes.AUTHENTICATION_FAILED,
                    `Провайдер отклонил авторизацию: ${request.query.error}`,
                );
                response.redirect(url, 302);
                return false;
            }
        } else {
            state = this.prepareState(request, response);
        }

        const passportOptions: Record<string, boolean | string> = {
            session: false,
            ...(state && { state }),
            ...(provider === OAuthProvider.GOOGLE && {
                accessType: 'offline',
                prompt: 'consent',
            }),
        };

        const GuardClass = this.guardClasses[provider];
        const targetGuard = new GuardClass(passportOptions);

        try {
            const result = targetGuard.canActivate(context);
            return isObservable(result) ? await firstValueFrom(result) : await result;
        } catch (error) {
            let code: string = OAuthErrorCodes.AUTHENTICATION_FAILED;
            let message = OAuthErrorMessages[OAuthErrorCodes.AUTHENTICATION_FAILED];

            if (error instanceof BaseException) {
                const res = error.getResponse() as { code?: string; message?: string };
                code = res.code || code;
                message = res.message || message;
            }

            const url = this.handleError(code, message);
            response.redirect(url, 302);
            return false;
        }
    }

    private prepareState(request: OAuthRequest, response: FastifyReply): string {
        const nonce = crypto.randomBytes(32).toString('hex');
        const connect = request.query.state;

        response.setCookie(OAUTH_CSRF_COOKIE_NAME, nonce, {
            httpOnly: true,
            sameSite: 'lax',
            secure: this.isProduction(),
            path: '/',
            signed: false,
            maxAge: OAUTH_CSRF_COOKIE_TTL_SECONDS,
        });

        return this.encodeState({ nonce, ...(connect && { connect }) });
    }

    private verifyCsrfState(request: OAuthRequest, response: FastifyReply) {
        const cookieNonce = request.cookies?.[OAUTH_CSRF_COOKIE_NAME];
        const payload = request.query.state ? this.decodeState(request.query.state) : null;

        response.clearCookie(OAUTH_CSRF_COOKIE_NAME, { path: '/' });

        if (!cookieNonce || !payload || !this.safeEqual(cookieNonce, payload.nonce)) {
            const url = this.handleError(
                OAuthErrorCodes.STATE_MISMATCH,
                OAuthErrorMessages[OAuthErrorCodes.STATE_MISMATCH],
            );
            response.redirect(url, 302);
            return false;
        }

        request.query.state = payload.connect;

        return payload.connect;
    }

    private encodeState(payload: OAuthStatePayload): string {
        return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
    }

    private decodeState(raw: string): OAuthStatePayload | null {
        try {
            const parsed: unknown = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));

            if (
                typeof parsed === 'object' &&
                parsed !== null &&
                'nonce' in parsed &&
                typeof (parsed as { nonce: unknown }).nonce === 'string'
            ) {
                return parsed as OAuthStatePayload;
            }

            return null;
        } catch {
            return null;
        }
    }

    private safeEqual(a: string, b: string): boolean {
        const bufA = Buffer.from(a);
        const bufB = Buffer.from(b);

        if (bufA.length !== bufB.length) {
            return false;
        }

        return crypto.timingSafeEqual(bufA, bufB);
    }

    private isProduction(): boolean {
        return this.cfg.get('NODE_ENV') === 'production';
    }

    private handleError(code: string, message: string) {
        const frontendUrl = this.cfg.get('FRONTEND_URL');

        const q = new URLSearchParams({
            success: 'false',
            message,
            code,
        });

        return `${frontendUrl}/oauth?${q.toString()}`;
    }
}
