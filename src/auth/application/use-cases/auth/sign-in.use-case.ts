import { SignInCacheData } from '@core/auth/application/interfaces';
import { AuthMailJobs, AuthQueues } from '@core/auth/domain/enums';
import { MailCodeEvent } from '@core/auth/domain/events';
import { EMAIL_CODE_TTL_SECONDS, SIGNIN_CACHE_KEY } from '@core/auth/infrastructure/constants';
import { OtpService } from '@core/auth/infrastructure/security';
import { FindByEmailQuery } from '@core/user/application/use-cases';
import { InjectQueue } from '@nestjs/bullmq';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';
import { BaseException } from '@shared/error';
import { Queue } from 'bullmq';

import { AuthErrorCodes, AuthErrorMessages } from '../../../domain/errors';
import { SignInDto } from '../../dtos';

@Injectable()
export class SignInUseCase {
    constructor(
        @Inject(CACHE_SERVICE)
        private readonly cacheService: ICacheService,
        @InjectQueue(AuthQueues.AUTH_MAIL)
        private readonly mailQueue: Queue,
        private readonly totpService: OtpService,
        private readonly findUserQ: FindByEmailQuery,
    ) {}

    async execute(dto: SignInDto) {
        const cachedData = await this.cacheService.getOne(SIGNIN_CACHE_KEY(dto.email));

        if (cachedData) {
            throw new BaseException(
                {
                    code: AuthErrorCodes.CODE_ALREADY_SENT,
                    message: AuthErrorMessages[AuthErrorCodes.CODE_ALREADY_SENT],
                    details: [{ target: 'email', message: 'Login code already sent' }],
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        try {
            const user = await this.findUserQ.execute(dto.email);

            if (!user) {
                throw new BaseException(
                    {
                        code: AuthErrorCodes.INVALID_CREDENTIALS,
                        message: AuthErrorMessages[AuthErrorCodes.INVALID_CREDENTIALS],
                    },
                    HttpStatus.UNAUTHORIZED,
                );
            }

            const { token, secret } = await this.totpService.generateCode();

            const data: SignInCacheData = {
                user: {
                    id: user.id,
                    email: user.email,
                },
                otp: {
                    token,
                    secret,
                },
            };

            await this.cacheService.setOne(
                SIGNIN_CACHE_KEY(user.email),
                JSON.stringify(data),
                EMAIL_CODE_TTL_SECONDS,
            );

            const event = new MailCodeEvent(user.email, token);
            await this.mailQueue.add(AuthMailJobs.SEND_LOGIN_CODE, event, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
            });

            return {
                success: true,
                message: 'Код авторизации отправлен на вашу почту',
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
