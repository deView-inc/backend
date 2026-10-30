import type { TaskView } from './repository';

/** Типовые и публичные видят все, приватные только автор */
export const canViewTask = (task: TaskView, userId: string): boolean =>
    task.isOfficial || task.visibility === 'public' || task.authorId === userId;

export const isTaskAuthor = (task: TaskView, userId: string): boolean =>
    task.authorId !== null && task.authorId === userId;
