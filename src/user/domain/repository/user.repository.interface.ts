import {
    UserCreateModel,
    UserEntity,
    UserPreferencesUpdateModel,
    UserProfileEntity,
    UserUpdateModel,
} from '@core/user/domain/entities';
import { NotificationSettings } from '@core/user/domain/enums';

export interface IUserRepository {
    create(data: UserCreateModel): Promise<UserEntity>;
    findById(id: string): Promise<UserEntity | null>;
    findByIds(ids: string[]): Promise<UserEntity[]>;
    findByEmail(email: string): Promise<UserEntity | null>;
    findByUsername(username: string): Promise<UserEntity | null>;
    findProfile(id: string): Promise<UserProfileEntity | null>;
    updateProfile(
        id: string,
        user: UserUpdateModel,
        preferences: UserPreferencesUpdateModel,
    ): Promise<boolean>;
    updateAvatar(id: string, url: string): Promise<boolean>;
    updateNotifications(userId: string, settings: NotificationSettings): Promise<boolean>;
}
