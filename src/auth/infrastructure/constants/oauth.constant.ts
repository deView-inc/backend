import type { Config } from '@libs/config';
import { HttpStatus } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { BaseException } from '@shared/error';

import { OAuthErrorCodes, OAuthErrorMessages } from '../../domain/errors';

export enum OAuthProvider {
    GOOGLE = 'google',
    GITHUB = 'github',
}

export const OAUTH_PROVIDERS = Object.values(OAuthProvider);

export const OAuthAssets: Record<
    OAuthProvider,
    { readonly value: OAuthProvider; readonly label: string }
> = {
    [OAuthProvider.GOOGLE]: {
        value: OAuthProvider.GOOGLE,
        label: 'Google',
    },
    [OAuthProvider.GITHUB]: {
        value: OAuthProvider.GITHUB,
        label: 'GitHub',
    },
};

export function isOAuthProvider(value: string): value is OAuthProvider {
    return (OAUTH_PROVIDERS as string[]).includes(value);
}

/**
 * Shared "is this a real provider" check used by the guard and every use-case
 * that accepts a provider from the outside (route param, body). Keeping it
 * here means the validation lives next to `OAuthProvider` itself instead of
 * being re-implemented at each call site.
 */
export function assertOAuthProvider(value: string): OAuthProvider {
    if (!isOAuthProvider(value)) {
        throw new BaseException(
            {
                code: OAuthErrorCodes.INVALID_PROVIDER,
                message: OAuthErrorMessages[OAuthErrorCodes.INVALID_PROVIDER],
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
        );
    }

    return value;
}

const OAUTH_ROUTE_PREFIX = 'v1/oauth';

export function getOAuthCallbackPath(provider: OAuthProvider): string {
    return `${OAUTH_ROUTE_PREFIX}/${provider}/callback`;
}

export function buildOAuthCallbackUrl(provider: OAuthProvider, cfg: ConfigService): string {
    const isProduction = cfg.get('NODE_ENV') === 'production';
    const domain = cfg.get('DOMAIN');
    const port = cfg.get('PORT');
    const path = getOAuthCallbackPath(provider);

    return domain
        ? `${isProduction ? 'https' : 'http'}://api.${domain}/${path}`
        : `http://localhost:${port || 3000}/${path}`;
}

const OAUTH_PROVIDER_CONFIG_KEYS: Record<
    OAuthProvider,
    { readonly id: keyof Config; readonly secret: keyof Config }
> = {
    [OAuthProvider.GOOGLE]: { id: 'GOOGLE_CLIENT_ID', secret: 'GOOGLE_CLIENT_SECRET' },
    [OAuthProvider.GITHUB]: { id: 'GITHUB_CLIENT_ID', secret: 'GITHUB_CLIENT_SECRET' },
};

export function isOAuthProviderConfigured(provider: OAuthProvider, cfg: ConfigService): boolean {
    const { id, secret } = OAUTH_PROVIDER_CONFIG_KEYS[provider];
    return Boolean(cfg.get(id) && cfg.get(secret));
}
