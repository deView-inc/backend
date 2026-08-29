import { CreateUserUseCase } from './create-user.use-case';
import { FindByEmailQuery } from './find-by-email.query';
import { FindByIdQuery } from './find-by-id.query';
import { FindByIdsQuery } from './find-by-ids.query';
import { FindByUsernameQuery } from './find-by-username.query';
import { FindProfileQuery } from './find-profile.query';
import { FindPublicProfileQuery } from './find-public-profile.query';
import { UpdateNotificationsUseCase } from './update-notifications.use-case';
import { UpdateProfileUseCase } from './update-profile.use-case';

export * from './update-notifications.use-case';
export * from './update-profile.use-case';
export * from './create-user.use-case';
export * from './find-by-email.query';
export * from './find-by-id.query';
export * from './find-by-username.query';
export * from './find-profile.query';
export * from './find-public-profile.query';
export * from './find-by-ids.query';

export const UserUseCases = [UpdateNotificationsUseCase, UpdateProfileUseCase, CreateUserUseCase];

export const UserQueries = [
    FindProfileQuery,
    FindPublicProfileQuery,
    FindByIdsQuery,
    FindByEmailQuery,
    FindByIdQuery,
    FindByUsernameQuery,
];

export const USER_EXTERNAL_USE_CASES = [
    CreateUserUseCase,
    FindByEmailQuery,
    FindByIdQuery,
    FindByUsernameQuery,
    FindByIdsQuery,
];
