import { describe, expect, it } from 'vitest';

import type { TaskView } from './repository';
import { canViewTask, isTaskAuthor } from './task-access';

const task = (over: Partial<TaskView>): TaskView => ({
    id: 't1',
    authorId: 'author',
    isOfficial: false,
    title: 'Задача',
    description: 'Описание',
    difficulty: 'middle',
    language: null,
    starterCode: null,
    tags: [],
    visibility: 'private',
    reportsCount: 0,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    author: null,
    ...over,
});

describe('доступ к задачам', () => {
    it('приватную видит только автор', () => {
        const t = task({ visibility: 'private' });

        expect(canViewTask(t, 'author')).toBe(true);
        expect(canViewTask(t, 'stranger')).toBe(false);
    });

    it('публичную видят все', () => {
        expect(canViewTask(task({ visibility: 'public' }), 'stranger')).toBe(true);
    });

    it('типовую видят все, даже если visibility у неё private', () => {
        expect(canViewTask(task({ isOfficial: true, authorId: null }), 'stranger')).toBe(true);
    });

    it('у типовой задачи нет автора, менять её не может никто', () => {
        const official = task({ isOfficial: true, authorId: null, visibility: 'public' });

        expect(isTaskAuthor(official, 'author')).toBe(false);
        expect(isTaskAuthor(official, '')).toBe(false);
    });

    it('автор определяется по authorId', () => {
        expect(isTaskAuthor(task({}), 'author')).toBe(true);
        expect(isTaskAuthor(task({}), 'stranger')).toBe(false);
    });
});
