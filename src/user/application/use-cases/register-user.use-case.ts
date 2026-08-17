import { CreateUserDto } from '@core/user/application/dtos';
import { UserEntity } from '@core/user/domain/entities';
import { IUserRepository } from '@core/user/domain/repository';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

import { UserErrorCodes, UserErrorMessages } from '../../domain/errors';

@Injectable()
export class RegisterUserUseCase {
    constructor(
        @Inject('IUserRepository')
        private readonly repository: IUserRepository,
    ) {}

    async execute(dto: CreateUserDto) {
        const existingUser = await this.repository.findByEmail(dto.email);

        if (existingUser) {
            throw new BaseException(
                {
                    code: UserErrorCodes.ALREADY_EXISTS,
                    message: UserErrorMessages[UserErrorCodes.ALREADY_EXISTS],
                    details: [{ target: 'email', value: dto.email }],
                },
                HttpStatus.CONFLICT,
            );
        }

        try {
            const entity = await this.repository.create(UserEntity.toCreateModel(dto));

            return entity.toDetailsJson();
        } catch (error) {
            if (error instanceof BaseException) {
                throw error;
            }

            throw new BaseException(
                {
                    code: UserErrorCodes.CREATE_FAILED,
                    message: UserErrorMessages[UserErrorCodes.CREATE_FAILED],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
