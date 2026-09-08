import { OAuthErrorCodes, OAuthErrorMessages } from '@core/auth/domain/errors';
import { assertOAuthProvider, OAuthProvider } from '@core/auth/infrastructure/constants';
import type { DeviceMetadata } from '@core/auth/infrastructure/utils';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseException, IErrorOptions, isBaseException } from '@shared/error';

import { OAuthResponse } from '../../dtos';
import { ConnectOAuthProviderUseCase } from './connect-oauth-provider.use-case';
import { ProcessOAuthSignUseCase } from './process-oauth-sign.use-case';

@Injectable()
export class HandleOAuthCallbackUseCase {
    constructor(
        private readonly cfg: ConfigService,
        private readonly processSignIn: ProcessOAuthSignUseCase,
        private readonly connectOAuthProvider: ConnectOAuthProviderUseCase,
    ) {}

    async execute(
        providerParam: OAuthProvider,
        rawProfile: unknown,
        meta: DeviceMetadata,
        state?: string,
    ) {
        try {
            const provider = assertOAuthProvider(providerParam);
            const dto = this.parseProfile(rawProfile, provider);
            const result = state
                ? await this.connectOAuthProvider.execute(dto, state)
                : await this.processSignIn.execute(dto, meta);

            const path = result.isConnect ? '/user/profile' : '/oauth';

            return `${this.getFrontendUrl()}${path}?${result.query.toString()}`;
        } catch (error) {
            return `${this.getFrontendUrl()}/oauth?${this.buildErrorQuery(error).toString()}`;
        }
    }

    private getFrontendUrl(): string {
        return this.cfg.get('FRONTEND_URL');
    }

    private parseProfile(rawProfile: unknown, provider: OAuthProvider): OAuthResponse {
        const candidate = { ...(rawProfile as Record<string, unknown>), provider };
        const parsed = OAuthResponse.schema.safeParse(candidate);

        if (!parsed.success) {
            throw new BaseException(
                {
                    code: OAuthErrorCodes.INVALID_PROVIDER_PROFILE,
                    message: OAuthErrorMessages[OAuthErrorCodes.INVALID_PROVIDER_PROFILE],
                    details: parsed.error.issues.map((issue) => ({
                        target: issue.path.join('.'),
                        message: issue.message,
                    })),
                },
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        return parsed.data;
    }

    private buildErrorQuery(error: unknown): URLSearchParams {
        let message = OAuthErrorMessages[OAuthErrorCodes.AUTHENTICATION_FAILED];
        let code: string = OAuthErrorCodes.AUTHENTICATION_FAILED;

        if (isBaseException(error)) {
            const response = error.getResponse() as IErrorOptions;
            message = response.message || message;
            code = response.code || code;
        }

        return new URLSearchParams({ success: 'false', message, code });
    }
}
