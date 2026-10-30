import { ROOM_PERMISSIONS } from '@core/rooms/domain/enums';
import type { IRoomRepository } from '@core/rooms/domain/repository';
import { TasksFacade } from '@core/tasks/tasks.facade';
import { Inject, Injectable } from '@nestjs/common';

import type { CreateRoomDto } from '../dtos';

@Injectable()
export class CreateRoomUseCase {
    constructor(
        @Inject('IRoomRepository') private readonly rooms: IRoomRepository,
        private readonly tasks: TasksFacade,
    ) {}

    async execute(ownerId: string, dto: CreateRoomDto) {
        // Явно выбранную задачу проверяем на доступ (404, если чужая приватная)
        // Не выбрана: берём типовую под сложность и язык, а если таких нет, комната без задачи
        const task = dto.taskId
            ? await this.tasks.requireVisible(dto.taskId, ownerId)
            : await this.tasks.pickOfficial(dto.difficulty, dto.language);

        const room = await this.rooms.create({
            ownerId,
            name: dto.name || 'Новая комната',
            language: dto.language,
            difficulty: dto.difficulty,
            isOpen: dto.isOpen,
            aiHints: dto.aiHints,
            recording: dto.recording,
            taskId: task?.id ?? null,
        });

        return {
            id: room.id,
            role: 'interviewer' as const,
            permissions: ROOM_PERMISSIONS.interviewer,
            taskId: room.taskId,
        };
    }
}
