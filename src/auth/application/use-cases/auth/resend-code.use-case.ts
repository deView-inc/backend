import { ResendCodeDto } from '@core/auth/application/dtos';
import { RESEND_CONFIGS } from '@core/auth/application/strategies';
import { AuthQueues } from '@core/auth/domain/enums';
import {
    EMAIL_CODE_TTL_SECONDS,
    MAX_ATTEMPTS,
    RESEND_ATTEMPTS_KEY,
    RESEND_COOLDOWN_KEY,
    SECONDS_BETWEEN_ATTEMPTS,
} from '@core/auth/infrastructure/constants';
import { OtpService } from '@core/auth/infrastructure/security';
import { InjectQueue } from '@nestjs/bullmq';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';
import { BaseException } from '@shared/error';
import { Queue } from 'bullmq';

import { AuthErrorCodes, AuthErrorMessages } from '../../../domain/errors';

@Injectable()
export class ResendCodeUseCase {
    constructor(
        @Inject(CACHE_SERVICE)
        private readonly cacheService: ICacheService,
        @InjectQueue(AuthQueues.AUTH_MAIL)
        private readonly mailQueue: Queue,
        private readonly totpService: OtpService,
    ) {}

    async execute(dto: ResendCodeDto) {
        const strategy = RESEND_CONFIGS[dto.context];
        const cachedDataStr = await this.cacheService.getOne(strategy.cacheKey(dto.email));

        if (!cachedDataStr) {
            throw new BaseException(
                {
                    code: strategy.cacheNotFoundCode,
                    message: strategy.cacheNotFoundMessage,
                    details: [{ target: 'email', value: dto.email }],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const cooldownKey = await this.handleCooldown(dto);
        const { attemptsKey, attemptsLeft } = await this.handleAttempts(dto);

        const cachedData = JSON.parse(cachedDataStr);
        const { token, secret } = await this.totpService.generateCode();
        const newCacheData = {
            ...cachedData,
            otp: {
                token,
                secret,
            },
        };

        await this.cacheService.setOne(
            strategy.cacheKey(dto.email),
            JSON.stringify(newCacheData),
            EMAIL_CODE_TTL_SECONDS,
        );

        await this.cacheService.setOne(
            attemptsKey,
            attemptsLeft.toString(),
            EMAIL_CODE_TTL_SECONDS,
        );

        await this.cacheService.setOne(cooldownKey, 'locked', SECONDS_BETWEEN_ATTEMPTS);

        await this.mailQueue.add(strategy.job, strategy.event(dto.email, token), {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 5000,
            },
        });

        return {
            success: true,
            message: strategy.successMessage,
            retries: attemptsLeft,
            ...this.buildResendTiming(SECONDS_BETWEEN_ATTEMPTS),
        };
    }

    private async handleCooldown(dto: ResendCodeDto) {
        const cooldownKey = RESEND_COOLDOWN_KEY(dto.context, dto.email);
        const { ttlSeconds: cooldownTtl } = await this.cacheService.getOneWithTtl(cooldownKey);

        if (cooldownTtl > 0) {
            throw new BaseException(
                {
                    code: AuthErrorCodes.RESEND_RATE_LIMIT,
                    message: `Повторная отправка доступна через ${this.formatWaitTime(cooldownTtl)}`,
                },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        return cooldownKey;
    }

    private async handleAttempts(dto: ResendCodeDto) {
        const attemptsKey = RESEND_ATTEMPTS_KEY(dto.context, dto.email);
        const attemptsStr = await this.cacheService.getOne(attemptsKey);

        let attemptsLeft = attemptsStr ? parseInt(attemptsStr, 10) : MAX_ATTEMPTS;

        if (attemptsLeft <= 0) {
            throw new BaseException(
                {
                    code: AuthErrorCodes.MAX_ATTEMPTS_REACHED,
                    message: AuthErrorMessages[AuthErrorCodes.MAX_ATTEMPTS_REACHED],
                },
                HttpStatus.FORBIDDEN,
            );
        }

        attemptsLeft -= 1;

        return { attemptsKey, attemptsLeft };
    }

    private buildResendTiming(retryAfterSeconds: number) {
        return {
            retryAfterSeconds,
            nextResendAt: new Date(Date.now() + retryAfterSeconds * 1000).toISOString(),
        };
    }

    private formatWaitTime(totalSeconds: number) {
        const minutesLeft = Math.floor(totalSeconds / 60);
        const secondsLeft = totalSeconds % 60;

        if (minutesLeft > 0) {
            return `${minutesLeft} мин ${secondsLeft} сек`;
        }

        return `${secondsLeft} сек`;
    }
}
