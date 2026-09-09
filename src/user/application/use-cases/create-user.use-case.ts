import { CreateUserDto } from '@core/user/application/dtos';
import { UserEntity } from '@core/user/domain/entities';
import { IUserRepository } from '@core/user/domain/repository';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

import { UserErrorCodes, UserErrorMessages } from '../../domain/errors';

@Injectable()
export class CreateUserUseCase {
    constructor(
        @Inject('IUserRepository')
        private readonly repository: IUserRepository,
    ) {}

    async execute(dto: CreateUserDto) {
        const existed = await this.repository.findByEmail(dto.email);

        if (existed) {
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
            return await this.repository.create(UserEntity.toCreateModel(dto));
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
                error,
            );
        }
    }
}
