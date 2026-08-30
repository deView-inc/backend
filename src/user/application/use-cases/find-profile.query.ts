import { IUserRepository } from '@core/user/domain/repository';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseException } from '@shared/error';
import { ImageHelper } from '@shared/utils';

import { UserErrorCodes, UserErrorMessages } from '../../domain/errors';

@Injectable()
export class FindProfileQuery {
    constructor(
        @Inject('IUserRepository') private readonly userRepo: IUserRepository,
        private readonly cfg: ConfigService,
    ) {}

    async execute(userId: string) {
        console.log('1');
        const entity = await this.userRepo.findProfile(userId);

        if (!entity) {
            throw new BaseException(
                {
                    code: UserErrorCodes.NOT_FOUND,
                    message: UserErrorMessages[UserErrorCodes.NOT_FOUND],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const { avatarUrl, ...user } = entity.user.toDetailsJson();

        const avatar = ImageHelper.responsive(this.cfg, avatarUrl);

        return {
            profile: {
                ...user,
                avatar,
            },
            preferences: entity.preferences.toJson(),
        };
    }
}
