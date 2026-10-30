import type { RoomDifficulty, RoomLanguage } from '@core/rooms/domain/enums';

import type { TaskReportReason, TaskScope, TaskVisibility } from '../enums';

export interface TaskAuthor {
    id: string;
    username: string;
    firstName: string;
}

export interface TaskRow {
    id: string;
    authorId: string | null;
    isOfficial: boolean;
    title: string;
    description: string;
    difficulty: RoomDifficulty;
    language: RoomLanguage | null;
    starterCode: string | null;
    tags: string[];
    visibility: TaskVisibility;
    reportsCount: number;
    createdAt: string;
    updatedAt: string;
}

/** Задача вместе с автором (null у типовых задач проекта) */
export type TaskView = TaskRow & { author: TaskAuthor | null };

export interface TaskCreateModel {
    authorId: string;
    title: string;
    description: string;
    difficulty: RoomDifficulty;
    language: RoomLanguage | null;
    starterCode: string | null;
    tags: string[];
    visibility: TaskVisibility;
}

export type TaskUpdateModel = Partial<Omit<TaskCreateModel, 'authorId'>>;

export interface TaskListFilter {
    scope: TaskScope;
    userId: string;
    difficulty?: RoomDifficulty;
    language?: RoomLanguage;
    search?: string;
    page: number;
    limit: number;
}

export interface TaskListResult {
    items: TaskView[];
    total: number;
}

export interface ITaskRepository {
    create(data: TaskCreateModel): Promise<TaskView>;
    findById(id: string): Promise<TaskView | null>;
    list(filter: TaskListFilter): Promise<TaskListResult>;
    update(id: string, data: TaskUpdateModel): Promise<TaskView | null>;
    delete(id: string): Promise<boolean>;
    /** Created: жалоба принята, duplicate: этот пользователь уже жаловался */
    report(
        taskId: string,
        reporterId: string,
        reason: TaskReportReason,
        comment: string | null,
    ): Promise<'created' | 'duplicate'>;
    /** Случайная типовая задача под сложность и язык (задачи без языка подходят всем) */
    pickOfficial(difficulty: RoomDifficulty, language: RoomLanguage): Promise<TaskView | null>;
}
