import { IIdentityRepository } from '@core/auth/domain/repository';
import { ACTIVE_SESSION_KEY, STATE_KEY } from '@core/auth/infrastructure/constants';
import { FindByIdQuery } from '@core/user/application/use-cases';
import { UserErrorCodes, UserErrorMessages } from '@core/user/domain/errors';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';
import { BaseException } from '@shared/error';

import { OAuthErrorCodes, OAuthErrorMessages } from '../../../domain/errors';
import { OAuthResponse } from '../../dtos';

@Injectable()
export class ConnectOAuthProviderUseCase {
    constructor(
        @Inject('IIdentityRepository')
        private readonly identityRepo: IIdentityRepository,
        @Inject(CACHE_SERVICE)
        private readonly cacheService: ICacheService,
        private readonly findUserQ: FindByIdQuery,
    ) {}

    async execute(dto: OAuthResponse, state: string) {
        const stateData = await this.getStateData(state);

        this.validateProvider(stateData, dto);

        const user = await this.findUserQ.execute(stateData.userId);

        if (!user) {
            throw new BaseException(
                {
                    code: UserErrorCodes.NOT_FOUND,
                    message: UserErrorMessages[UserErrorCodes.NOT_FOUND],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        await this.validateProviderNotConnected(user.id, dto.provider, dto.id);

        await this.identityRepo.create({
            userId: user.id,
            avatarUrl: dto.avatarUrl,
            provider: dto.provider,
            providerUserId: dto.id,
            email: dto.email,
        });

        await this.cacheService.removeMany([ACTIVE_SESSION_KEY(user.id), STATE_KEY(state)]);

        const query = new URLSearchParams({
            success: 'true',
            provider: dto.provider,
        });

        return { isConnect: true, query };
    }

    private async getStateData(state: string) {
        const rawData = await this.cacheService.getOne(STATE_KEY(state));
        if (!rawData) {
            throw new BaseException(
                {
                    code: OAuthErrorCodes.INVALID_OR_EXPIRED_STATE,
                    message: OAuthErrorMessages[OAuthErrorCodes.INVALID_OR_EXPIRED_STATE],
                },
                HttpStatus.BAD_REQUEST,
            );
        }
        return JSON.parse(rawData);
    }

    private validateProvider(stateData: any, dto: OAuthResponse) {
        if (stateData.action !== 'connect') {
            throw new BaseException(
                {
                    code: OAuthErrorCodes.INVALID_ACTION,
                    message: OAuthErrorMessages[OAuthErrorCodes.INVALID_ACTION],
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        if (stateData.provider !== dto.provider) {
            throw new BaseException(
                {
                    code: OAuthErrorCodes.PROVIDER_MISMATCH,
                    message: OAuthErrorMessages[OAuthErrorCodes.PROVIDER_MISMATCH],
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    private async validateProviderNotConnected(
        userId: string,
        provider: string,
        providerUserId: string,
    ) {
        const existingIdentity = await this.identityRepo.findByProvider(
            provider as any,
            providerUserId,
        );

        if (existingIdentity && existingIdentity.userId !== userId) {
            throw new BaseException(
                {
                    code: OAuthErrorCodes.PROVIDER_ALREADY_USED,
                    message: OAuthErrorMessages[OAuthErrorCodes.PROVIDER_ALREADY_USED],
                },
                HttpStatus.CONFLICT,
            );
        }

        const userIdentities = await this.identityRepo.findAllByUserId(userId);
        const alreadyConnected = userIdentities.some((i) => i.provider === provider);

        if (alreadyConnected) {
            throw new BaseException(
                {
                    code: OAuthErrorCodes.PROVIDER_ALREADY_CONNECTED,
                    message: OAuthErrorMessages[OAuthErrorCodes.PROVIDER_ALREADY_CONNECTED],
                },
                HttpStatus.CONFLICT,
            );
        }
    }
}
