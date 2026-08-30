import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

import { AuthErrorCodes, AuthErrorMessages } from '../../../domain/errors';
import { ISessionRepository } from '../../../domain/repository';
import { TokenService } from '../../../infrastructure/security';

@Injectable()
export class SignOutUseCase {
    constructor(
        @Inject('ISessionRepository')
        private readonly sessionRepo: ISessionRepository,
        private readonly tokenService: TokenService,
    ) {}

    async execute(token?: string) {
        if (!token) {
            throw new BaseException(
                {
                    code: AuthErrorCodes.UNAUTHORIZED,
                    message: AuthErrorMessages[AuthErrorCodes.UNAUTHORIZED],
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        const payload = await this.tokenService.validateToken(token, 'refresh');

        if (!payload?.jti) {
            throw new BaseException(
                {
                    code: AuthErrorCodes.SESSION_EXPIRED,
                    message: AuthErrorMessages[AuthErrorCodes.SESSION_EXPIRED],
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        try {
            const session = await this.sessionRepo.findById(payload.jti);

            if (!session) {
                return {
                    success: true,
                    message: 'Сессия уже завершена',
                };
            }

            const result = await this.sessionRepo.revoke(session.id);

            return { success: result, message: 'Успешно вышли из системы!' };
        } catch (error) {
            if (error instanceof BaseException) {
                throw error;
            }

            throw new BaseException(
                {
                    code: AuthErrorCodes.SIGNOUT_FAILED,
                    message: AuthErrorMessages[AuthErrorCodes.SIGNOUT_FAILED],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
