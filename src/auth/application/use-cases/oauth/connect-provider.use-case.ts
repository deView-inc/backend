import { IIdentityRepository } from '@core/auth/domain/repository';
import {
    ACTIVE_SESSION_KEY,
    getOAuthCallbackPath,
    OAuthAssets,
    OAuthProvider,
    STATE_KEY,
    STATE_TTL_SECONDS,
} from '@core/auth/infrastructure/constants';
import { FindByIdQuery } from '@core/user/application/use-cases';
import { UserErrorCodes, UserErrorMessages } from '@core/user/domain/errors';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';
import { BaseException } from '@shared/error';

import { OAuthErrorCodes, OAuthErrorMessages } from '../../../domain/errors';

@Injectable()
export class ConnectProviderUseCase {
    constructor(
        @Inject(CACHE_SERVICE)
        private readonly cacheService: ICacheService,
        @Inject('IIdentityRepository')
        private readonly identityRepo: IIdentityRepository,
        private readonly findUserQ: FindByIdQuery,
    ) {}

    async execute(provider: OAuthProvider, userId: string) {
        await this.userExist(userId);
        await this.validateProviderNotConnected(userId, provider);
        await this.validateNoActiveSession(userId, provider);

        const stateCode = createId();
        const stateData = {
            code: stateCode,
            provider,
            userId,
            action: 'connect',
            createdAt: Date.now(),
        };

        await this.cacheService.setOne(
            STATE_KEY(stateCode),
            JSON.stringify(stateData),
            STATE_TTL_SECONDS,
        );

        const activeSession = {
            provider,
            stateCode,
            createdAt: Date.now(),
            expiresAt: Date.now() + STATE_TTL_SECONDS * 1000,
        };

        await this.cacheService.setOne(
            ACTIVE_SESSION_KEY(userId),
            JSON.stringify(activeSession),
            STATE_TTL_SECONDS,
        );

        return { success: true, url: `${getOAuthCallbackPath(provider)}?state=${stateCode}` };
    }

    private async userExist(userId: string) {
        const user = await this.findUserQ.execute(userId);

        if (!user) {
            throw new BaseException(
                {
                    code: UserErrorCodes.NOT_FOUND,
                    message: UserErrorMessages[UserErrorCodes.NOT_FOUND],
                },
                HttpStatus.NOT_FOUND,
            );
        }
    }

    private async validateProviderNotConnected(userId: string, provider: string) {
        const identities = await this.identityRepo.findAllByUserId(userId);
        const isConnected = identities.some((identity) => identity.provider === provider);

        if (isConnected) {
            throw new BaseException(
                {
                    code: OAuthErrorCodes.PROVIDER_ALREADY_CONNECTED,
                    message: OAuthErrorMessages[OAuthErrorCodes.PROVIDER_ALREADY_CONNECTED],
                },
                HttpStatus.CONFLICT,
            );
        }
    }

    private async validateNoActiveSession(userId: string, newProvider: OAuthProvider) {
        const activeSessionRaw = await this.cacheService.getOne(ACTIVE_SESSION_KEY(userId));

        if (activeSessionRaw) {
            const activeSession = JSON.parse(activeSessionRaw);
            const timeLeft = Math.ceil((activeSession.expiresAt - Date.now()) / 1000);
            const minutesLeft = Math.floor(timeLeft / 60);
            const secondsLeft = timeLeft % 60;

            const timeMessage =
                minutesLeft > 0 ? `${minutesLeft} мин ${secondsLeft} сек` : `${secondsLeft} сек`;

            const isSameProvider = activeSession.provider === newProvider;
            const providerName = this.getProviderName(activeSession.provider);

            const message = isSameProvider
                ? `У вас уже есть активный процесс авторизации через ${providerName}. Подождите ${timeMessage} или завершите его в другом окне.`
                : `У вас уже есть активный процесс авторизации через ${providerName}. Дождитесь его завершения (${timeMessage}) или отмените, чтобы начать через ${this.getProviderName(newProvider)}.`;

            throw new BaseException(
                {
                    code: OAuthErrorCodes.ACTIVE_OAUTH_SESSION_EXISTS,
                    message,
                    details: [
                        {
                            activeProvider: activeSession.provider,
                            requestedProvider: newProvider,
                            isSameProvider,
                            timeLeftSeconds: timeLeft,
                            expiresAt: activeSession.expiresAt,
                        },
                    ],
                },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }
    }

    private getProviderName(provider: OAuthProvider): string {
        return OAuthAssets[provider].label;
    }
}
