import { can, type RoomPermission } from '@core/rooms/domain/enums';
import type { IRoomRepository } from '@core/rooms/domain/repository';

import { RoomErrors } from './room-access';

/** Проверяет, что комната есть и у пользователя в ней есть нужное право. Возвращает комнату. */
export async function requireRoomPermission(
    rooms: IRoomRepository,
    roomId: string,
    userId: string,
    permission: RoomPermission,
) {
    const room = await rooms.findById(roomId);

    if (!room) {
        throw RoomErrors.notFound();
    }

    const member = await rooms.findMember(roomId, userId);

    if (!member || !can(member.role, permission)) {
        throw RoomErrors.forbidden();
    }

    return room;
}
