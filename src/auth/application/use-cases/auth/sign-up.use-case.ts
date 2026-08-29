import { SignUpCacheData } from '@core/auth/application/interfaces';
import { EMAIL_CODE_TTL_SECONDS, SIGNUP_CACHE_KEY } from '@core/auth/infrastructure/constants';
import { OtpService } from '@core/auth/infrastructure/security';
import { FindByEmailQuery } from '@core/user/application/use-cases';
import { UserErrorCodes, UserErrorMessages } from '@core/user/domain/errors';
import { InjectQueue } from '@nestjs/bullmq';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';
import { BaseException } from '@shared/error';
import { Queue } from 'bullmq';

import { AuthQueues, AuthMailJobs } from '../../../domain/enums';
import { AuthErrorCodes, AuthErrorMessages } from '../../../domain/errors';
import { MailCodeEvent } from '../../../domain/events';
import { SignUpDto } from '../../dtos';

@Injectable()
export class SignUpUseCase {
    constructor(
        @Inject(CACHE_SERVICE)
        private readonly cacheService: ICacheService,
        @InjectQueue(AuthQueues.AUTH_MAIL)
        private readonly mailQueue: Queue,
        private readonly totpService: OtpService,
        private readonly findUserQ: FindByEmailQuery,
    ) {}

    async execute(dto: SignUpDto) {
        const cachedData = await this.cacheService.getOne(SIGNUP_CACHE_KEY(dto.email));

        if (cachedData) {
            throw new BaseException(
                {
                    code: AuthErrorCodes.CODE_ALREADY_SENT,
                    message: AuthErrorMessages[AuthErrorCodes.CODE_ALREADY_SENT],
                    details: [{ target: 'email', message: 'Verification code already sent' }],
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        try {
            const existed = await this.findUserQ.execute(dto.email);

            if (existed) {
                throw new BaseException(
                    {
                        code: UserErrorCodes.ALREADY_EXISTS,
                        message: UserErrorMessages[UserErrorCodes.ALREADY_EXISTS],
                    },
                    HttpStatus.CONFLICT,
                );
            }

            const { token, secret } = await this.totpService.generateCode();

            const data: SignUpCacheData = {
                user: dto,
                otp: {
                    token,
                    secret,
                },
            };

            await this.cacheService.setOne(
                SIGNUP_CACHE_KEY(dto.email),
                JSON.stringify(data),
                EMAIL_CODE_TTL_SECONDS,
            );

            const event = new MailCodeEvent(dto.email, token);
            await this.mailQueue.add(AuthMailJobs.SEND_REGISTER_CODE, event, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
            });

            return {
                success: true,
                message: 'Код подтверждения отправлен на вашу почту',
            };
        } catch (error) {
            if (error instanceof BaseException) {
                throw error;
            }

            throw new BaseException(
                {
                    code: AuthErrorCodes.SIGNUP_FAILED,
                    message: AuthErrorMessages[AuthErrorCodes.SIGNUP_FAILED],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
