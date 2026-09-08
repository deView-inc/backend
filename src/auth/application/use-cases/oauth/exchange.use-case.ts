import { AuthMailJobs, AuthQueues } from '@core/auth/domain/enums';
import { MailCurrentSessionEvent } from '@core/auth/domain/events';
import {
    CreateUserUseCase,
    FindByEmailQuery,
    FindByIdQuery,
} from '@core/user/application/use-cases';
import { UserEntity } from '@core/user/domain/entities';
import { UserErrorCodes, UserErrorMessages } from '@core/user/domain/errors';
import { InjectQueue } from '@nestjs/bullmq';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';
import { BaseException } from '@shared/error';
import { Queue } from 'bullmq';

import { OAuthErrorCodes, OAuthErrorMessages } from '../../../domain/errors';
import { IIdentityRepository, ISessionRepository } from '../../../domain/repository';
import { EXCHANGE_TOKEN_NAME } from '../../../infrastructure/constants';
import { TokenService } from '../../../infrastructure/security';
import type { DeviceMetadata } from '../../../infrastructure/utils';
import { ExchangeDto, type IOAuthExchangeData } from '../../dtos';

@Injectable()
export class ExchangeUseCase {
    constructor(
        @Inject('ISessionRepository')
        private readonly sessionRepo: ISessionRepository,
        @Inject(CACHE_SERVICE)
        private readonly cacheService: ICacheService,
        @Inject('IIdentityRepository')
        private readonly identityRepo: IIdentityRepository,
        @InjectQueue(AuthQueues.AUTH_MAIL)
        private readonly mailQueue: Queue,
        private readonly tokenService: TokenService,
        private readonly registerUserUC: CreateUserUseCase,
        private readonly findUserById: FindByIdQuery,
        private readonly findUserByEmail: FindByEmailQuery,
    ) {}

    async execute(dto: ExchangeDto, meta: DeviceMetadata) {
        const data = await this.validateAndGetData(dto);

        const { user, isNewUser } = await this.processUser(data);

        const tokens = await this.handleSession(user, meta);

        return {
            success: true,
            message: isNewUser ? 'Регистрация выполнена успешно' : 'Вход выполнен успешно',
            access: tokens.access,
            refresh: tokens.refresh,
            expiresAt: tokens.expiresAt,
            provider: data.provider,
        };
    }

    private async validateAndGetData(dto: ExchangeDto) {
        const key = EXCHANGE_TOKEN_NAME(dto.token);
        const rawData = await this.cacheService.getOne(key);

        if (!rawData) {
            throw new BaseException(
                {
                    code: OAuthErrorCodes.EXCHANGE_TOKEN_INVALID,
                    message: OAuthErrorMessages[OAuthErrorCodes.EXCHANGE_TOKEN_INVALID],
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        const data: IOAuthExchangeData = JSON.parse(rawData);
        await this.cacheService.removeOne(key);

        if (!data.email || !data.provider) {
            throw new BaseException(
                {
                    code: OAuthErrorCodes.DATA_CORRUPTION,
                    message: OAuthErrorMessages[OAuthErrorCodes.DATA_CORRUPTION],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        if (data.provider !== dto.provider) {
            throw new BaseException(
                {
                    code: OAuthErrorCodes.EXCHANGE_TOKEN_INVALID,
                    message: OAuthErrorMessages[OAuthErrorCodes.EXCHANGE_TOKEN_INVALID],
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        return data;
    }

    private async processUser(data: IOAuthExchangeData) {
        const identity = await this.identityRepo.findByProvider(data.provider, data.id);

        if (identity) {
            const user = await this.findUserById.execute(identity.userId);

            if (!user) {
                throw new BaseException(
                    {
                        code: UserErrorCodes.NOT_FOUND,
                        message: UserErrorMessages[UserErrorCodes.NOT_FOUND],
                    },
                    HttpStatus.BAD_REQUEST,
                );
            }

            return { user, isNewUser: false };
        }

        const user = await this.findUserByEmail.execute(data.email);

        if (user) {
            await this.identityRepo.create({
                userId: user.id,
                avatarUrl: data.avatarUrl,
                provider: data.provider,
                providerUserId: data.id,
                email: data.email,
            });

            return { user, isNewUser: false };
        }

        return this.register(data);
    }

    private async register(data: IOAuthExchangeData) {
        const user = await this.registerUserUC.execute({
            ...data,
            firstName: data.first_name,
            grade: 'trainee',
            stack: [],
        });

        await this.identityRepo.create({
            userId: user.id,
            avatarUrl: data.avatarUrl,
            provider: data.provider,
            providerUserId: data.id,
            email: data.email,
        });

        return { user, isNewUser: true };
    }

    private async handleSession(user: UserEntity, meta: DeviceMetadata) {
        try {
            const sessionId = createId();

            const tokens = await this.tokenService.generateTokens(
                { id: user.id, email: user.email },
                sessionId,
            );

            const { deviceType, browser, os, city, country, createdAt, ip } =
                await this.sessionRepo.create({
                    id: sessionId,
                    userId: user.id,
                    expiresAt: tokens.expiresAt.toISOString(),
                    ...meta,
                });

            const event = new MailCurrentSessionEvent(user.email, {
                deviceType,
                browser,
                os,
                city,
                country,
                createdAt,
                ip,
            });

            await this.mailQueue.add(AuthMailJobs.SEND_CURRENT_SESSION, event, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
            });

            return tokens;
        } catch (error) {
            if (error instanceof BaseException) {
                throw error;
            }

            throw new BaseException(
                {
                    code: OAuthErrorCodes.SESSION_CREATION_FAILED,
                    message: OAuthErrorMessages[OAuthErrorCodes.SESSION_CREATION_FAILED],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }
}
