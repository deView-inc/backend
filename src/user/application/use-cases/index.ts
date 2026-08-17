import { FindByEmailQuery } from './find-by-email.query';
import { FindByIdQuery } from './find-by-id.query';
import { FindByIdsQuery } from './find-by-ids.query';
import { FindByUsernameQuery } from './find-by-username.query';
import { FindProfileQuery } from './find-profile.query';
import { RegisterUserUseCase } from './register-user.use-case';
import { UpdateNotificationsUseCase } from './update-notifications.use-case';
import { UpdateProfileUseCase } from './update-profile.use-case';

export * from './register-user.use-case';
export * from './update-notifications.use-case';
export * from './update-profile.use-case';
export * from './find-by-email.query';
export * from './find-by-id.query';
export * from './find-by-username.query';
export * from './find-profile.query';
export * from './find-by-ids.query';

export const UserUseCases = [RegisterUserUseCase, UpdateNotificationsUseCase, UpdateProfileUseCase];

export const UserQueries = [
    FindProfileQuery,
    FindByIdsQuery,
    FindByEmailQuery,
    FindByIdQuery,
    FindByUsernameQuery,
];

export const USER_EXTERNAL_USE_CASES = [
    RegisterUserUseCase,
    FindByEmailQuery,
    FindByIdQuery,
    FindByUsernameQuery,
    FindByIdsQuery,
];
