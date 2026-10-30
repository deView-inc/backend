import type { TaskView } from '../domain/repository';

// Postgres отдаёт '2026-10-28 20:32:50+00', Safari такое не разбирает, поэтому отдаём ISO
const iso = (value: string) => new Date(value).toISOString();

/** Что отдаём наружу. Счётчик жалоб виден только автору задачи. */
export function toTaskResponse(task: TaskView, userId: string) {
    const isMine = task.authorId !== null && task.authorId === userId;

    return {
        id: task.id,
        title: task.title,
        description: task.description,
        difficulty: task.difficulty,
        language: task.language,
        starterCode: task.starterCode,
        tags: task.tags,
        visibility: task.visibility,
        isOfficial: task.isOfficial,
        isMine,
        author: task.author,
        createdAt: iso(task.createdAt),
        updatedAt: iso(task.updatedAt),
        ...(isMine ? { reportsCount: task.reportsCount } : {}),
    };
}

export type TaskResponseData = ReturnType<typeof toTaskResponse>;
