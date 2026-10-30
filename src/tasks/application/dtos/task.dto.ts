import {
    TASK_DIFFICULTIES,
    TASK_LANGUAGES,
    TASK_REPORT_REASONS,
    TASK_SCOPES,
    TASK_VISIBILITIES,
} from '@core/tasks/domain/enums';
import { requireAnyKey } from '@shared/utils/require-any-key.util';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod/v4';

const MAX_TEXT = 20_000;

const tagSchema = z.string().trim().min(1).max(30);

// Поля без значений по умолчанию. В Zod 4 .partial() сохраняет .default(), и пропущенное поле в PATCH
// Молча заменялось бы значением по умолчанию (публичная задача становилась приватной, теги стирались).
const TaskFieldsSchema = z.object({
    title: z.string().trim().min(3, 'Название слишком короткое').max(150),
    description: z.string().trim().min(1, 'Описание не может быть пустым').max(MAX_TEXT),
    difficulty: z.enum(TASK_DIFFICULTIES),
    language: z
        .enum(TASK_LANGUAGES)
        .nullish()
        .describe('Язык задачи. Если не указан, задача подходит для любого языка'),
    starterCode: z.string().max(MAX_TEXT).nullish().describe('Стартовый код для кандидата'),
    tags: z.array(tagSchema).max(10),
    visibility: z
        .enum(TASK_VISIBILITIES)
        .describe('private: видна только автору, public: попадает в общую библиотеку'),
});

export const CreateTaskSchema = TaskFieldsSchema.extend({
    tags: TaskFieldsSchema.shape.tags.default([]),
    visibility: TaskFieldsSchema.shape.visibility.default('private'),
});
export class CreateTaskDto extends createZodDto(CreateTaskSchema) {}

export const UpdateTaskSchema = requireAnyKey(TaskFieldsSchema.partial());
export class UpdateTaskDto extends createZodDto(UpdateTaskSchema) {}

export const ListTasksQuerySchema = z.object({
    scope: z
        .enum(TASK_SCOPES)
        .default('all')
        .describe('all: типовые и сообщества, official, community, mine: мои задачи'),
    difficulty: z.enum(TASK_DIFFICULTIES).optional(),
    language: z.enum(TASK_LANGUAGES).optional(),
    search: z.string().trim().min(1).max(100).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});
export class ListTasksQueryDto extends createZodDto(ListTasksQuerySchema) {}

export const ReportTaskSchema = z.object({
    reason: z.enum(TASK_REPORT_REASONS),
    comment: z.string().trim().max(500).optional(),
});
export class ReportTaskDto extends createZodDto(ReportTaskSchema) {}
