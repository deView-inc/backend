import { UserErrorCodes, UserErrorMessages } from '@core/user/domain/errors';
import { IUserRepository } from '@core/user/domain/repository';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

@Injectable()
export class FindByUsernameQuery {
    constructor(@Inject('IUserRepository') private readonly userRepo: IUserRepository) {}

    async execute(username: string) {
        console.log('2');
        const entity = await this.userRepo.findByUsername(username);

        if (!entity) {
            throw new BaseException(
                {
                    code: UserErrorCodes.NOT_FOUND,
                    message: UserErrorMessages[UserErrorCodes.NOT_FOUND],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        return entity;
    }
}
