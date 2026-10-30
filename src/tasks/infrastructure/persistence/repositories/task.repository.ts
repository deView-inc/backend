import type { RoomDifficulty, RoomLanguage } from '@core/rooms/domain/enums';
import { REPORTS_HIDE_THRESHOLD, type TaskReportReason } from '@core/tasks/domain/enums';
import type {
    ITaskRepository,
    TaskCreateModel,
    TaskListFilter,
    TaskUpdateModel,
    TaskView,
} from '@core/tasks/domain/repository';
import { users } from '@core/user/infrastructure/persistence/models';
import { DATABASE_SERVICE, DatabaseService } from '@libs/database';
import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, ilike, isNull, lt, or, sql, type SQL } from 'drizzle-orm';

import * as sc from '../models';

const TASK_VIEW_COLUMNS = {
    task: sc.tasks,
    author: { id: users.id, username: users.username, firstName: users.firstName },
};

@Injectable()
export class TaskRepository implements ITaskRepository {
    constructor(
        @Inject(DATABASE_SERVICE)
        private readonly db: DatabaseService<typeof sc>,
    ) {}

    private readonly toView = (row: {
        task: typeof sc.tasks.$inferSelect;
        author: { id: string; username: string; firstName: string } | null;
    }): TaskView => ({
        ...row.task,
        author: row.author,
    });

    public create = async (data: TaskCreateModel) => {
        const [created] = await this.db
            .insert(sc.tasks)
            .values(data)
            .returning({ id: sc.tasks.id });

        if (!created) {
            throw new Error('never');
        }

        const view = await this.findById(created.id);

        if (!view) {
            throw new Error('never');
        }

        return view;
    };

    public findById = async (id: string) => {
        const [row] = await this.db
            .select(TASK_VIEW_COLUMNS)
            .from(sc.tasks)
            .leftJoin(users, eq(sc.tasks.authorId, users.id))
            .where(eq(sc.tasks.id, id));

        return row ? this.toView(row) : null;
    };

    public list = async (f: TaskListFilter) => {
        const notHidden = lt(sc.tasks.reportsCount, REPORTS_HIDE_THRESHOLD);
        // Библиотека: типовые + публичные сообщества, не скрытые жалобами
        const community = and(
            eq(sc.tasks.visibility, 'public'),
            eq(sc.tasks.isOfficial, false),
            notHidden,
        );
        const official = eq(sc.tasks.isOfficial, true);

        const scopeCondition: Record<TaskListFilter['scope'], SQL | undefined> = {
            all: or(official, community),
            official,
            community,
            mine: eq(sc.tasks.authorId, f.userId),
        };

        const conditions: (SQL | undefined)[] = [scopeCondition[f.scope]];

        if (f.difficulty) {
            conditions.push(eq(sc.tasks.difficulty, f.difficulty));
        }

        if (f.language) {
            // Задачи без языка подходят любому языку
            conditions.push(or(eq(sc.tasks.language, f.language), isNull(sc.tasks.language)));
        }

        if (f.search) {
            const pattern = `%${f.search.replaceAll(/[%_\\]/g, String.raw`\$&`)}%`;
            conditions.push(
                or(ilike(sc.tasks.title, pattern), ilike(sc.tasks.description, pattern)),
            );
        }

        const where = and(...conditions);

        const [items, [totalRow]] = await Promise.all([
            this.db
                .select(TASK_VIEW_COLUMNS)
                .from(sc.tasks)
                .leftJoin(users, eq(sc.tasks.authorId, users.id))
                .where(where)
                // Типовые сверху, потом новые
                .orderBy(desc(sc.tasks.isOfficial), desc(sc.tasks.createdAt), sc.tasks.id)
                .limit(f.limit)
                .offset((f.page - 1) * f.limit),
            this.db
                .select({ count: sql<number>`count(*)::int` })
                .from(sc.tasks)
                .where(where),
        ]);

        return { items: items.map(this.toView), total: totalRow?.count ?? 0 };
    };

    public update = async (id: string, data: TaskUpdateModel) => {
        const result = await this.db
            .update(sc.tasks)
            .set({ ...data, updatedAt: new Date().toISOString() })
            .where(eq(sc.tasks.id, id));

        if ((result?.count ?? 0) === 0) {
            return null;
        }

        return this.findById(id);
    };

    public delete = async (id: string) => {
        const result = await this.db.delete(sc.tasks).where(eq(sc.tasks.id, id));

        return (result?.count ?? 0) > 0;
    };

    public report = async (
        taskId: string,
        reporterId: string,
        reason: TaskReportReason,
        comment: string | null,
    ) =>
        this.db.transaction(async (tx) => {
            const inserted = await tx
                .insert(sc.taskReports)
                .values({ taskId, reporterId, reason, comment })
                .onConflictDoNothing()
                .returning({ id: sc.taskReports.id });

            if (inserted.length === 0) {
                return 'duplicate' as const;
            }

            await tx
                .update(sc.tasks)
                .set({ reportsCount: sql`${sc.tasks.reportsCount} + 1` })
                .where(eq(sc.tasks.id, taskId));

            return 'created' as const;
        });

    public pickOfficial = async (difficulty: RoomDifficulty, language: RoomLanguage) => {
        const [row] = await this.db
            .select(TASK_VIEW_COLUMNS)
            .from(sc.tasks)
            .leftJoin(users, eq(sc.tasks.authorId, users.id))
            .where(
                and(
                    eq(sc.tasks.isOfficial, true),
                    eq(sc.tasks.difficulty, difficulty),
                    or(eq(sc.tasks.language, language), isNull(sc.tasks.language)),
                ),
            )
            .orderBy(sql`random()`)
            .limit(1);

        return row ? this.toView(row) : null;
    };
}
