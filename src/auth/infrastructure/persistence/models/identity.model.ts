import { OAuthProvider } from '@core/auth/infrastructure/constants';
import { createId } from '@paralleldrive/cuid2';
import { baseSchema, users } from '@shared/entities';
import { text, timestamp, varchar, unique } from 'drizzle-orm/pg-core';

export const userIdentities = baseSchema.table(
    'user_identities',
    {
        id: text('id')
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text('user_id')
            .references(() => users.id, { onDelete: 'cascade' })
            .notNull(),
        provider: varchar('provider', { length: 50 }).$type<OAuthProvider>().notNull(),
        providerUserId: varchar('provider_user_id', { length: 255 }).notNull(),
        email: varchar('email', { length: 255 }).notNull(),
        avatarUrl: varchar('avatar_url', { length: 255 }),
        connectedAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        providerUserIdIdx: unique('provider_user_id_idx').on(table.provider, table.providerUserId),
    }),
);
