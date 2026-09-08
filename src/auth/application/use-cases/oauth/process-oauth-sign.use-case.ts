import crypto from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';

import { IIdentityRepository } from '../../../domain/repository';
import { EXCHANGE_TOKEN_NAME, EXCHANGE_TOKEN_TTL } from '../../../infrastructure/constants';
import type { DeviceMetadata } from '../../../infrastructure/utils';
import { IOAuthExchangeData, OAuthResponse } from '../../dtos';

@Injectable()
export class ProcessOAuthSignUseCase {
    constructor(
        @Inject(CACHE_SERVICE)
        private readonly cacheService: ICacheService,
        @Inject('IIdentityRepository')
        private readonly identityRepo: IIdentityRepository,
    ) {}

    async execute(dto: OAuthResponse, meta: DeviceMetadata) {
        const identity = await this.identityRepo.findByProvider(dto.provider, dto.id);

        const token = crypto.randomBytes(32).toString('hex');

        const data: IOAuthExchangeData = {
            isNewUser: identity ? true : false,
            userId: identity?.userId ?? null,
            ...dto,
            ip: meta.ip,
            provider: dto.provider,
        };

        await this.cacheService.setOne(
            EXCHANGE_TOKEN_NAME(token),
            JSON.stringify(data),
            EXCHANGE_TOKEN_TTL,
        );

        const query = new URLSearchParams({
            token,
            success: 'true',
            provider: dto.provider,
        });

        return { isConnect: false, query };
    }
}
