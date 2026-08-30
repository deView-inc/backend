import { SignUpCacheData } from '@core/auth/application/interfaces';
import { SIGNUP_CACHE_KEY } from '@core/auth/infrastructure/constants';
import { CreateUserUseCase } from '@core/user/application/use-cases';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';
import { BaseException } from '@shared/error';

import { AuthErrorCodes, AuthErrorMessages } from '../../../domain/errors';
import { ISessionRepository } from '../../../domain/repository';
import { TokenService, OtpService } from '../../../infrastructure/security';
import { DeviceMetadata } from '../../../infrastructure/utils/get-device-meta';
import { VerifyDto } from '../../dtos';

@Injectable()
export class SignUpVerifyUseCase {
    constructor(
        @Inject(CACHE_SERVICE)
        private readonly cacheService: ICacheService,
        @Inject('ISessionRepository')
        private readonly sessionRepo: ISessionRepository,
        private readonly totpService: OtpService,
        private readonly tokenService: TokenService,
        private readonly createUserUC: CreateUserUseCase,
    ) {}

    async execute(dto: VerifyDto, meta: DeviceMetadata) {
        const cachedData = await this.cacheService.getOne(SIGNUP_CACHE_KEY(dto.email));

        if (!cachedData) {
            throw new BaseException(
                {
                    code: AuthErrorCodes.REGISTRATION_EXPIRED,
                    message: AuthErrorMessages[AuthErrorCodes.REGISTRATION_EXPIRED],
                },
                HttpStatus.GONE,
            );
        }

        const userData: SignUpCacheData = JSON.parse(cachedData);

        if (!userData?.otp) {
            throw new BaseException(
                {
                    code: AuthErrorCodes.DATA_CORRUPTION,
                    message: AuthErrorMessages[AuthErrorCodes.DATA_CORRUPTION],
                    details: [{ target: 'cache', message: 'Поврежденные данные регистрации' }],
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
                    details: [{ target: 'code', message: 'Неверный код подтверждения' }],
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        try {
            await this.cacheService.removeOne(SIGNUP_CACHE_KEY(dto.email));

            const user = await this.createUserUC.execute(userData.user);

            const sessionId = createId();
            const { access, refresh, expiresAt } = await this.tokenService.generateTokens(
                user,
                sessionId,
            );

            await this.sessionRepo.create({
                id: sessionId,
                userId: user.id,
                ...meta,
                expiresAt: expiresAt.toISOString(),
            });

            return {
                success: true,
                tokens: { access, refresh },
                expiresAt,
                message: 'Аккаунт успешно подтвержден',
            };
        } catch (error) {
            console.log(error);
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
