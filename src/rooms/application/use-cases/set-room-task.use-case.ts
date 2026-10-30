import type { IRoomRepository } from '@core/rooms/domain/repository';
import { TasksFacade } from '@core/tasks/tasks.facade';
import { Inject, Injectable } from '@nestjs/common';

import type { SetRoomTaskDto } from '../dtos';
import { RoomErrors } from './room-access';
import { requireRoomPermission } from './room-guard';

@Injectable()
export class SetRoomTaskUseCase {
    constructor(
        @Inject('IRoomRepository') private readonly rooms: IRoomRepository,
        private readonly tasks: TasksFacade,
    ) {}

    async execute(roomId: string, userId: string, dto: SetRoomTaskDto) {
        const room = await requireRoomPermission(this.rooms, roomId, userId, 'manageRoom');

        if (room.closedAt) {
            throw RoomErrors.closed();
        }

        if (dto.taskId) {
            // Выбрать можно только ту задачу, которую пользователь вправе видеть
            await this.tasks.requireVisible(dto.taskId, userId);
        }

        await this.rooms.setTask(roomId, dto.taskId);

        return { success: true, taskId: dto.taskId };
    }
}
