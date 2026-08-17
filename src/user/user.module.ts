import { UserController } from '@core/user/application/controllers';
import {
    RegisterUserUseCase,
    USER_EXTERNAL_USE_CASES,
    UserQueries,
    UserUseCases,
} from '@core/user/application/use-cases';
import { UserFacade } from '@core/user/application/user.facade';
import { UserRepository } from '@core/user/infrastructure/persistence/repositories';
import { Module } from '@nestjs/common';

const REPOSITORY = {
    provide: 'IUserRepository',
    useClass: UserRepository,
};

@Module({
    imports: [],
    controllers: [UserController],
    //TODO; remove register later
    providers: [RegisterUserUseCase, ...UserUseCases, ...UserQueries, UserFacade, REPOSITORY],
    exports: [...USER_EXTERNAL_USE_CASES],
})
export class UserModule {}
