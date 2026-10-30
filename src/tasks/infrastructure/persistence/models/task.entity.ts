import {
    roomDifficultyEnum,
    roomLanguageEnum,
} from '@core/rooms/infrastructure/persistence/models/enums';
import { TASK_REPORT_REASONS, TASK_VISIBILITIES } from '@core/tasks/domain/enums';
import { users } from '@core/user/infrastructure/persistence/models';
import { createId } from '@paralleldrive/cuid2';
import { baseSchema } from '@shared/entities';
import { sql } from 'drizzle-orm';
import { boolean, index, integer, text, timestamp, unique, varchar } from 'drizzle-orm/pg-core';

export const taskVisibilityEnum = baseSchema.enum('task_visibility', TASK_VISIBILITIES);
export const taskReportReasonEnum = baseSchema.enum('task_report_reason', TASK_REPORT_REASONS);

export const tasks = baseSchema.table(
    'tasks',
    {
        id: text('id')
            .primaryKey()
            .$defaultFn(() => createId()),
        // Null у типовых задач проекта
        authorId: text('author_id').references(() => users.id, { onDelete: 'cascade' }),
        isOfficial: boolean('is_official').default(false).notNull(),
        title: varchar('title', { length: 150 }).notNull(),
        description: text('description').notNull(),
        difficulty: roomDifficultyEnum('difficulty').notNull(),
        // Null: задача подходит для любого языка
        language: roomLanguageEnum('language'),
        starterCode: text('starter_code'),
        tags: text('tags')
            .array()
            .notNull()
            .default(sql`ARRAY[]::text[]`),
        visibility: taskVisibilityEnum('visibility').default('private').notNull(),
        reportsCount: integer('reports_count').default(0).notNull(),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
            .defaultNow()
            .notNull(),
    },
    (t) => [
        index('tasks_author_idx').on(t.authorId),
        index('tasks_library_idx').on(t.visibility, t.isOfficial, t.difficulty),
    ],
);

export const taskReports = baseSchema.table(
    'task_reports',
    {
        id: text('id')
            .primaryKey()
            .$defaultFn(() => createId()),
        taskId: text('task_id')
            .notNull()
            .references(() => tasks.id, { onDelete: 'cascade' }),
        reporterId: text('reporter_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        reason: taskReportReasonEnum('reason').notNull(),
        comment: varchar('comment', { length: 500 }),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
            .defaultNow()
            .notNull(),
    },
    // Одна жалоба от пользователя на задачу
    (t) => [unique('task_reports_task_reporter_uq').on(t.taskId, t.reporterId)],
);
