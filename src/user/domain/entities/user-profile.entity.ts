import { UserPreferencesEntity } from './preferences.domain';
import { UserEntity } from './user.domain';

export interface UserProfileParts {
    user: UserEntity;
    preferences: UserPreferencesEntity;
}

export class UserProfileEntity {
    readonly user: UserEntity;
    readonly preferences: UserPreferencesEntity;

    constructor(parts: UserProfileParts) {
        this.user = parts.user;
        this.preferences = parts.preferences;
    }

    get id(): string {
        return this.user.id;
    }

    get isDeleted(): boolean {
        return this.user.isDeleted;
    }

    public toJson() {
        return {
            ...this.user.toDetailsJson(),
            preferences: this.preferences.toJson(),
        };
    }

    public toPublicJson() {
        return this.user.toPublicJson();
    }
}
