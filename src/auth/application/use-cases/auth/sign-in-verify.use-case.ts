import { SignInCacheData } from '@core/auth/application/interfaces';
import { AuthMailJobs, AuthQueues } from '@core/auth/domain/enums';
import { MailCurrentSessionEvent } from '@core/auth/domain/events/mail-current-session.event';
import { SIGNIN_CACHE_KEY } from '@core/auth/infrastructure/constants';
import { InjectQueue } from '@nestjs/bullmq';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';
import { BaseException } from '@shared/error';
import { Queue } from 'bullmq';

import { AuthErrorCodes, AuthErrorMessages } from '../../../domain/errors';
import { ISessionRepository } from '../../../domain/repository';
import { OtpService, TokenService } from '../../../infrastructure/security';
import { DeviceMetadata } from '../../../infrastructure/utils/get-device-meta';
import { VerifyDto } from '../../dtos';

@Injectable()
export class SignInVerifyUseCase {
    constructor(
        @Inject(CACHE_SERVICE)
        private readonly cacheService: ICacheService,
        @Inject('ISessionRepository')
        private readonly sessionRepo: ISessionRepository,
        @InjectQueue(AuthQueues.AUTH_MAIL)
        private readonly mailQueue: Queue,
        private readonly totpService: OtpService,
        private readonly tokenService: TokenService,
    ) {}

    async execute(dto: VerifyDto, meta: DeviceMetadata) {
        const cachedData = await this.cacheService.getOne(SIGNIN_CACHE_KEY(dto.email));

        if (!cachedData) {
            throw new BaseException(
                {
                    code: AuthErrorCodes.AUTHORIZATION_EXPIRED,
                    message: AuthErrorMessages[AuthErrorCodes.AUTHORIZATION_EXPIRED],
                },
                HttpStatus.GONE,
            );
        }

        const userData: SignInCacheData = JSON.parse(cachedData);

        if (!userData?.otp || !userData.user.email) {
            throw new BaseException(
                {
                    code: AuthErrorCodes.DATA_CORRUPTION,
                    message: AuthErrorMessages[AuthErrorCodes.DATA_CORRUPTION],
                    details: [{ target: 'cache', message: 'Поврежденные данные авторизации' }],
                },
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        const isValid = await this.totpService.verifyCode(
            dto.code,
            userData.otp.token,
            userData.otp.secret,
        );

        if (!isValid) {
            throw new BaseException(
                {
                    code: AuthErrorCodes.INVALID_CODE,
                    message: AuthErrorMessages[AuthErrorCodes.INVALID_CODE],
                    details: [{ target: 'code', message: 'Неверный код авторизации' }],
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        try {
            await this.cacheService.removeOne(SIGNIN_CACHE_KEY(dto.email));

            const sessionId = createId();
            const { access, refresh, expiresAt } = await this.tokenService.generateTokens(
                userData.user,
                sessionId,
            );

            const { deviceType, browser, os, city, country, createdAt, ip } =
                await this.sessionRepo.create({
                    id: sessionId,
                    userId: userData.user.id,
                    expiresAt: expiresAt.toISOString(),
                    ...meta,
                });

            const event = new MailCurrentSessionEvent(dto.email, {
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

            return {
                success: true,
                tokens: {
                    access,
                    refresh,
                },
                expiresAt,
                message: 'Вы успешно вошли в систему',
            };
        } catch (error) {
            if (error instanceof BaseException) {
                throw error;
            }

            throw new BaseException(
                {
                    code: AuthErrorCodes.SIGNIN_FAILED,
                    message: AuthErrorMessages[AuthErrorCodes.SIGNIN_FAILED],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
