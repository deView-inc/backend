import { createDefaultNotificationSettings, NotificationSettings } from '@core/user/domain/enums';
import {
    userGenderEnum,
    userGradeEnum,
    userPronounsEnum,
    userThemeEnum,
} from '@core/user/infrastructure/persistence/models/enum';
import { createId } from '@paralleldrive/cuid2';
import { baseSchema } from '@shared/entities';
import { sql } from 'drizzle-orm';
import { varchar, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const users = baseSchema.table('users', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => createId()),
    username: varchar('username', { length: 50 }).notNull().unique(),
    firstName: varchar('first_name', { length: 50 }).notNull(),
    lastName: varchar('last_name', { length: 50 }),
    occupation: varchar('occupation', { length: 50 }),
    location: varchar('location', { length: 255 }),
    grade: userGradeEnum('grade').default('trainee').notNull(),
    stack: text('stack')
        .array()
        .notNull()
        .default(sql`ARRAY[]::text[]`),
    email: varchar('email', { length: 255 }).notNull().unique(),
    bio: text('bio'),
    gender: userGenderEnum('gender'),
    pronouns: userPronounsEnum('pronouns'),
    pronounsCustom: varchar('pronouns_custom', { length: 50 }),
    avatarUrl: varchar('avatar_url', { length: 512 }),
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
        .defaultNow()
        .notNull(),

    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
        .defaultNow()
        .notNull(),
});

export const userPreferences = baseSchema.table('user_preferences', {
    userId: text('user_id')
        .primaryKey()
        .references(() => users.id, { onDelete: 'cascade' }),
    theme: userThemeEnum('theme').default('system').notNull(),
    timezone: varchar('timezone', { length: 50 }).default('UTC').notNull(),
    language: varchar('language', { length: 5 }).default('ru').notNull(),
});

export const userSecurity = baseSchema.table('user_security', {
    userId: text('user_id')
        .primaryKey()
        .references(() => users.id, { onDelete: 'cascade' }),
    recoveryEmail: varchar('recovery_email', { length: 255 }),
    is2faEnabled: boolean('is_2fa_enabled').default(false).notNull(),
    twoFactorSecret: text('two_factor_secret'),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true, mode: 'string' }),
});

export const userNotifications = baseSchema.table('user_notifications', {
    userId: text('user_id')
        .primaryKey()
        .references(() => users.id, { onDelete: 'cascade' }),
    settings: jsonb('settings')
        .$type<NotificationSettings>()
        .default(createDefaultNotificationSettings())
        .notNull(),
});
