import {
    ROOM_DIFFICULTIES,
    ROOM_LANGUAGES,
    ROOM_PERMISSIONS,
    ROOM_ROLES,
} from '@core/rooms/domain/enums';
import { TaskResponseSchema } from '@core/tasks/application/dtos/task-response.dto';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod/v4';

const ALL_PERMISSIONS = [...new Set(Object.values(ROOM_PERMISSIONS).flat())] as [
    string,
    ...string[],
];

const roleSchema = z.enum(ROOM_ROLES);
const permissionsSchema = z
    .array(z.enum(ALL_PERMISSIONS))
    .describe('Что разрешено роли: фронт строит UI по этим правам, а не по названию роли');

export const CreateRoomResponseSchema = z.object({
    id: z.string().describe('Идентификатор комнаты, он же часть ссылки'),
    role: roleSchema,
    permissions: permissionsSchema,
    taskId: z.string().nullable().describe('Выбранная или подобранная автоматически задача'),
});
export class CreateRoomResponse extends createZodDto(CreateRoomResponseSchema) {}

export const JoinRoomResponseSchema = z.object({
    roomId: z.string(),
    role: roleSchema,
    permissions: permissionsSchema,
});
export class JoinRoomResponse extends createZodDto(JoinRoomResponseSchema) {}

export const RoomDetailsResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    language: z.enum(ROOM_LANGUAGES),
    difficulty: z.enum(ROOM_DIFFICULTIES),
    isOpen: z.boolean(),
    aiHints: z.boolean(),
    recording: z.boolean(),
    ownerId: z.string(),
    createdAt: z.string().describe('ISO 8601'),
    closedAt: z.string().nullable().describe('ISO 8601, null пока комната идёт'),
    me: z.object({ userId: z.string(), role: roleSchema, permissions: permissionsSchema }),
    task: TaskResponseSchema.nullable().describe('null, если задачи нет'),
});
export class RoomDetailsResponse extends createZodDto(RoomDetailsResponseSchema) {}

export const RoomMembersResponseSchema = z.object({
    items: z.array(
        z.object({
            userId: z.string(),
            role: roleSchema,
            joinedAt: z.string().describe('ISO 8601'),
            isOwner: z.boolean(),
            user: z.object({
                username: z.string(),
                firstName: z.string(),
                lastName: z.string().nullable(),
                avatarUrl: z.string().nullable(),
            }),
        }),
    ),
});
export class RoomMembersResponse extends createZodDto(RoomMembersResponseSchema) {}

export const SetRoomTaskResponseSchema = z.object({
    success: z.boolean(),
    taskId: z.string().nullable(),
});
export class SetRoomTaskResponse extends createZodDto(SetRoomTaskResponseSchema) {}
