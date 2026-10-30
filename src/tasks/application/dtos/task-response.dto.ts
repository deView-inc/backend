import { TASK_DIFFICULTIES, TASK_LANGUAGES, TASK_VISIBILITIES } from '@core/tasks/domain/enums';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod/v4';

export const TaskResponseSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().describe('Описание в markdown'),
    difficulty: z.enum(TASK_DIFFICULTIES),
    language: z.enum(TASK_LANGUAGES).nullable().describe('null: подходит для любого языка'),
    starterCode: z.string().nullable(),
    tags: z.array(z.string()),
    visibility: z.enum(TASK_VISIBILITIES),
    isOfficial: z.boolean().describe('Типовая задача проекта'),
    isMine: z.boolean().describe('Автор задачи: текущий пользователь'),
    author: z
        .object({ id: z.string(), username: z.string(), firstName: z.string() })
        .nullable()
        .describe('null у типовых задач проекта'),
    createdAt: z.string().describe('ISO 8601'),
    updatedAt: z.string().describe('ISO 8601'),
    reportsCount: z.number().int().optional().describe('Число жалоб, приходит только автору'),
});
export class TaskResponse extends createZodDto(TaskResponseSchema) {}

export const TaskListResponseSchema = z.object({
    items: z.array(TaskResponseSchema).describe('Пустой массив, если задач нет'),
    meta: z.object({
        total: z.number().int(),
        page: z.number().int(),
        limit: z.number().int(),
        totalPages: z.number().int(),
        hasNextPage: z.boolean(),
        hasPrevPage: z.boolean(),
    }),
});
export class TaskListResponse extends createZodDto(TaskListResponseSchema) {}
