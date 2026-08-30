import { FindByIdQuery } from '@core/user/application/use-cases';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { BaseException } from '@shared/error';

import { AuthErrorCodes, AuthErrorMessages } from '../../../domain/errors';
import { ISessionRepository } from '../../../domain/repository';
import { TokenService } from '../../../infrastructure/security';
import type { DeviceMetadata } from '../../../infrastructure/utils';

@Injectable()
export class RefreshTokensUseCase {
    constructor(
        @Inject('ISessionRepository')
        private readonly sessionRepo: ISessionRepository,
        private readonly tokenService: TokenService,
        private readonly findUserQ: FindByIdQuery,
    ) {}

    async execute(token: string | undefined, metadata: DeviceMetadata) {
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
                    code: AuthErrorCodes.TOKEN_INVALID,
                    message: AuthErrorMessages[AuthErrorCodes.TOKEN_INVALID],
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        const session = await this.sessionRepo.findById(payload.jti);

        if (!session) {
            throw new BaseException(
                {
                    code: AuthErrorCodes.SESSION_NOT_FOUND,
                    message: AuthErrorMessages[AuthErrorCodes.SESSION_NOT_FOUND],
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        if (session.isRevoked) {
            throw new BaseException(
                {
                    code: AuthErrorCodes.SESSION_REVOKED,
                    message: AuthErrorMessages[AuthErrorCodes.SESSION_REVOKED],
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        const entity = await this.findUserQ.execute(session.userId);

        if (!entity) {
            await this.sessionRepo.revoke(session.id);
            throw new BaseException(
                {
                    code: 'USER_NOT_FOUND',
                    message: 'Аккаунт пользователя не найден',
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        try {
            await this.sessionRepo.revoke(session.id);

            const sessionId = createId();
            const { access, refresh, expiresAt } = await this.tokenService.generateTokens(
                entity,
                sessionId,
            );

            await this.sessionRepo.create({
                id: sessionId,
                userId: entity.id,
                ...metadata,
                expiresAt: expiresAt.toISOString(),
            });

            return {
                success: true,
                tokens: { access, refresh },
                expiresAt,
                message: 'Токены успешно обновлены',
            };
        } catch (error) {
            if (error instanceof BaseException) {
                throw error;
            }

            throw new BaseException(
                {
                    code: AuthErrorCodes.REFRESH_FAILED,
                    message: AuthErrorMessages[AuthErrorCodes.REFRESH_FAILED],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
