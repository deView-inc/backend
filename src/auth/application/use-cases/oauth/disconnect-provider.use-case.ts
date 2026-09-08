import { IIdentityRepository } from '@core/auth/domain/repository';
import { OAuthProvider } from '@core/auth/infrastructure/constants';
import { FindByIdQuery } from '@core/user/application/use-cases';
import { UserErrorCodes, UserErrorMessages } from '@core/user/domain/errors';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

import { OAuthErrorCodes, OAuthErrorMessages } from '../../../domain/errors';

@Injectable()
export class DisconnectProviderUseCase {
    constructor(
        @Inject('IIdentityRepository')
        private readonly identityRepo: IIdentityRepository,
        private readonly findUserQ: FindByIdQuery,
    ) {}

    async execute(provider: OAuthProvider, userId: string) {
        const user = await this.findUserQ.execute(userId);

        if (!user) {
            throw new BaseException(
                {
                    code: UserErrorCodes.NOT_FOUND,
                    message: UserErrorMessages[UserErrorCodes.NOT_FOUND],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const providers = await this.identityRepo.findAllByUserId(user.id);
        const targetProvider = providers.find((p) => p.provider === provider);

        if (!targetProvider) {
            throw new BaseException(
                {
                    code: OAuthErrorCodes.PROVIDER_NOT_LINKED,
                    message: OAuthErrorMessages[OAuthErrorCodes.PROVIDER_NOT_LINKED],
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        await this.identityRepo.delete(targetProvider.id);

        return {
            success: true,
            message: `Провайдер ${provider} успешно отвязан`,
        };
    }
}
