import { UpdateNotificationsDto } from '@core/user/application/dtos';
import { IUserRepository } from '@core/user/domain/repository';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

import { UserErrorCodes, UserErrorMessages } from '../../domain/errors';

@Injectable()
export class UpdateNotificationsUseCase {
    constructor(
        @Inject('IUserRepository')
        private readonly userRepo: IUserRepository,
    ) {}

    async execute(id: string, dto: UpdateNotificationsDto) {
        const user = await this.userRepo.findById(id);

        if (!user) {
            throw new BaseException(
                {
                    code: UserErrorCodes.NOT_FOUND,
                    message: UserErrorMessages[UserErrorCodes.NOT_FOUND],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        try {
            await this.userRepo.updateNotifications(id, dto);

            return {
                success: true,
                message: 'Настройки уведомлений обновлены',
            };
        } catch (error) {
            if (error instanceof BaseException) {
                throw error;
            }

            throw new BaseException(
                {
                    code: UserErrorCodes.UPDATE_FAILED,
                    message: UserErrorMessages[UserErrorCodes.UPDATE_FAILED],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }
}
