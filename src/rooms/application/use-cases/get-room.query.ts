import { ROOM_PERMISSIONS } from '@core/rooms/domain/enums';
import type { IRoomRepository } from '@core/rooms/domain/repository';
import { toTaskResponse } from '@core/tasks/application/task-response';
import { TasksFacade } from '@core/tasks/tasks.facade';
import { Inject, Injectable } from '@nestjs/common';

import { RoomErrors } from './room-access';

@Injectable()
export class GetRoomQuery {
    constructor(
        @Inject('IRoomRepository') private readonly rooms: IRoomRepository,
        private readonly tasks: TasksFacade,
    ) {}

    async execute(roomId: string, userId: string) {
        const room = await this.rooms.findById(roomId);

        if (!room) {
            throw RoomErrors.notFound();
        }

        // Данные комнаты видят только её участники: сначала POST /rooms/:id/join
        const member = await this.rooms.findMember(roomId, userId);

        if (!member) {
            throw RoomErrors.forbidden();
        }

        // Задача, выбранная для комнаты, видна всем участникам, даже если у автора она приватная
        const task = room.taskId ? await this.tasks.findForRoom(room.taskId) : null;

        return {
            id: room.id,
            name: room.name,
            language: room.language,
            difficulty: room.difficulty,
            isOpen: room.isOpen,
            aiHints: room.aiHints,
            recording: room.recording,
            ownerId: room.ownerId,
            createdAt: new Date(room.createdAt).toISOString(),
            closedAt: room.closedAt ? new Date(room.closedAt).toISOString() : null,
            me: {
                userId,
                role: member.role,
                permissions: ROOM_PERMISSIONS[member.role],
            },
            task: task ? toTaskResponse(task, userId) : null,
        };
    }
}
