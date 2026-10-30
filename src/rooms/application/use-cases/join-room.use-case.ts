import { ROOM_PERMISSIONS } from '@core/rooms/domain/enums';
import type { IRoomRepository } from '@core/rooms/domain/repository';
import { Inject, Injectable } from '@nestjs/common';

import { RoomErrors } from './room-access';

@Injectable()
export class JoinRoomUseCase {
    constructor(@Inject('IRoomRepository') private readonly rooms: IRoomRepository) {}

    async execute(roomId: string, userId: string) {
        const room = await this.rooms.findById(roomId);

        if (!room) {
            throw RoomErrors.notFound();
        }

        if (room.closedAt) {
            throw RoomErrors.closed();
        }

        // Уже в комнате: роль не трогаем, иначе повторный заход понизит владельца
        const existing = await this.rooms.findMember(roomId, userId);
        // Открытая комната -> зритель, закрытая (по ссылке) -> участник
        const member =
            existing ??
            (await this.rooms.addMember(roomId, userId, room.isOpen ? 'viewer' : 'participant'));

        return {
            roomId,
            role: member.role,
            permissions: ROOM_PERMISSIONS[member.role],
        };
    }
}
