import {
    UserCreateModel,
    UserEntity,
    UserPreferencesEntity,
    UserPreferencesUpdateModel,
    UserProfileEntity,
    UserUpdateModel,
} from '@core/user/domain/entities';
import { NotificationSettings } from '@core/user/domain/enums';
import { type IUserRepository } from '@core/user/domain/repository';
import { DATABASE_SERVICE, DatabaseService } from '@libs/database';
import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray, isNull } from 'drizzle-orm';

import * as sc from '../models';

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(
        @Inject(DATABASE_SERVICE)
        private readonly db: DatabaseService<typeof sc>,
    ) {}

    public findProfile = async (id: string) => {
        const [row] = await this.db
            .select({
                user: sc.users,
                preferences: sc.userPreferences,
            })
            .from(sc.users)
            .innerJoin(sc.userPreferences, eq(sc.users.id, sc.userPreferences.userId))
            .where(eq(sc.users.id, id));

        if (!row) {
            return null;
        }

        return new UserProfileEntity({
            user: new UserEntity(row.user),
            preferences: new UserPreferencesEntity(row.preferences),
        });
    };

    public findByIds = async (ids: string[]) => {
        const rows = await this.db.select().from(sc.users).where(inArray(sc.users.id, ids));

        return rows.map((r) => new UserEntity(r));
    };

    public findById = async (id: string) => {
        const [row] = await this.db.select().from(sc.users).where(eq(sc.users.id, id));

        if (!row) {
            return null;
        }

        return new UserEntity(row);
    };

    public findByEmail = async (email: string) => {
        const [row] = await this.db.select().from(sc.users).where(eq(sc.users.email, email));

        if (!row) {
            return null;
        }

        return new UserEntity(row);
    };

    public findByUsername = async (username: string) => {
        const [row] = await this.db.select().from(sc.users).where(eq(sc.users.username, username));

        if (!row) {
            return null;
        }

        return new UserEntity(row);
    };

    public create = async (data: UserCreateModel) => {
        const user = await this.db.transaction(async (tx) => {
            const [newUser] = await tx
                .insert(sc.users)
                .values(UserEntity.toCreateModel(data))
                .returning();

            if (!newUser) {
                throw new Error('never');
            }
            await tx.insert(sc.userSecurity).values({ userId: newUser.id });
            await tx.insert(sc.userNotifications).values({ userId: newUser.id });
            await tx.insert(sc.userPreferences).values({ userId: newUser.id });

            return newUser;
        });

        return new UserEntity(user);
    };

    public updateProfile = async (
        id: string,
        user: UserUpdateModel,
        preferences: UserPreferencesUpdateModel,
    ) =>
        this.db.transaction(async (tx) => {
            let updated = 0;

            if (user && Object.keys(user).length) {
                const result = await tx
                    .update(sc.users)
                    .set({ ...user, updatedAt: new Date().toISOString() })
                    .where(and(eq(sc.users.id, id), isNull(sc.users.deletedAt)));

                updated += result.count ?? 0;
            }

            if (preferences && Object.keys(preferences).length) {
                const result = await tx
                    .update(sc.userPreferences)
                    .set(preferences)
                    .where(eq(sc.userPreferences.userId, id));

                updated += result.count ?? 0;
            }

            return updated > 0;
        });

    public updateNotifications = async (userId: string, settings: NotificationSettings) => {
        const result = await this.db
            .update(sc.userNotifications)
            .set({ settings })
            .where(eq(sc.userNotifications.userId, userId));

        return (result?.count ?? 0) > 0;
    };

    public updateAvatar = async (id: string, url: string) => {
        const result = await this.db
            .update(sc.users)
            .set({ avatarUrl: url, updatedAt: new Date().toISOString() })
            .where(eq(sc.users.id, id));

        return (result?.count ?? 0) > 0;
    };
}
