import { IUserRepository } from '@core/user/domain/repository';
import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { BaseException } from '@shared/error';

import { UserErrorCodes, UserErrorMessages } from '../../domain/errors';
import { UpdateProfileDto } from '../dtos';

@Injectable()
export class UpdateProfileUseCase {
    constructor(
        @Inject('IUserRepository')
        private readonly userRepo: IUserRepository,
    ) {}

    async execute(id: string, dto: UpdateProfileDto) {
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

        this.validatePronouns(dto);

        try {
            const result = await this.userRepo.updateProfile(
                user.id,
                dto.profile ?? {},
                dto.preferences ?? {},
            );

            return {
                success: result,
                message: result ? 'Профиль успешно обновлен' : 'Профиль не был обновлен',
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
            );
        }
    }
    private validatePronouns(dto: UpdateProfileDto) {
        if (dto.profile?.pronouns) {
            if (
                dto.profile.pronouns === 'other' &&
                (!dto.profile.pronounsCustom || dto.profile.pronounsCustom.trim() === '')
            ) {
                throw new BaseException(
                    {
                        code: UserErrorCodes.PRONOUNS_CUSTOM_REQUIRED,
                        message: UserErrorMessages[UserErrorCodes.PRONOUNS_CUSTOM_REQUIRED],
                    },
                    HttpStatus.BAD_REQUEST,
                );
            }

            if (dto.profile.pronounsCustom && dto.profile.pronounsCustom.length > 50) {
                throw new BaseException(
                    {
                        code: UserErrorCodes.PRONOUNS_CUSTOM_TOO_LONG,
                        message: UserErrorMessages[UserErrorCodes.PRONOUNS_CUSTOM_TOO_LONG],
                    },
                    HttpStatus.BAD_REQUEST,
                );
            }
        }
    }
}
