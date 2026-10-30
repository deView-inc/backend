import { tasks } from '@core/tasks/infrastructure/persistence/models';
import { users } from '@core/user/infrastructure/persistence/models';
import { createId } from '@paralleldrive/cuid2';
import { baseSchema } from '@shared/entities';
import { boolean, primaryKey, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { roomDifficultyEnum, roomLanguageEnum, roomRoleEnum } from './enums';

export const rooms = baseSchema.table('rooms', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => createId()),
    ownerId: text('owner_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 100 }).notNull(),
    language: roomLanguageEnum('language').notNull(),
    difficulty: roomDifficultyEnum('difficulty').notNull(),
    isOpen: boolean('is_open').default(true).notNull(),
    aiHints: boolean('ai_hints').default(false).notNull(),
    recording: boolean('recording').default(false).notNull(),
    // Если задачу удалят, комната остаётся, просто без задачи
    taskId: text('task_id').references(() => tasks.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
        .defaultNow()
        .notNull(),
    closedAt: timestamp('closed_at', { withTimezone: true, mode: 'string' }),
});

export const roomMembers = baseSchema.table(
    'room_members',
    {
        roomId: text('room_id')
            .notNull()
            .references(() => rooms.id, { onDelete: 'cascade' }),
        userId: text('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        role: roomRoleEnum('role').notNull(),
        joinedAt: timestamp('joined_at', { withTimezone: true, mode: 'string' })
            .defaultNow()
            .notNull(),
    },
    (t) => [primaryKey({ columns: [t.roomId, t.userId] })],
);
