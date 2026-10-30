import { ROOM_DIFFICULTIES, ROOM_LANGUAGES, ROOM_ROLES } from '@core/rooms/domain/enums';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod/v4';

export const CreateRoomSchema = z.object({
    name: z.string().trim().max(100).optional().describe('Название комнаты'),
    language: z.enum(ROOM_LANGUAGES).describe('Язык программирования'),
    difficulty: z.enum(ROOM_DIFFICULTIES).describe('Уровень сложности'),
    isOpen: z.boolean().default(true).describe('Открытая комната: входящие получают роль viewer'),
    aiHints: z.boolean().default(false).describe('AI-подсказки'),
    recording: z.boolean().default(false).describe('Запись сессии'),
    taskId: z
        .string()
        .min(1)
        .nullish()
        .describe('Задача из библиотеки. Если не указана, подберётся типовая по сложности'),
});
export class CreateRoomDto extends createZodDto(CreateRoomSchema) {}

export const UpdateMemberRoleSchema = z.object({
    role: z.enum(ROOM_ROLES).describe('Новая роль участника'),
});
export class UpdateMemberRoleDto extends createZodDto(UpdateMemberRoleSchema) {}

export const SetRoomTaskSchema = z.object({
    taskId: z.string().min(1).nullable().describe('Id задачи или null, чтобы убрать задачу'),
});
export class SetRoomTaskDto extends createZodDto(SetRoomTaskSchema) {}
