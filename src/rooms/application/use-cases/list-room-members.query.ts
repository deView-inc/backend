import type { IRoomRepository } from '@core/rooms/domain/repository';
import { Inject, Injectable } from '@nestjs/common';

import { RoomErrors } from './room-access';

@Injectable()
export class ListRoomMembersQuery {
    constructor(@Inject('IRoomRepository') private readonly rooms: IRoomRepository) {}

    async execute(roomId: string, userId: string) {
        const room = await this.rooms.findById(roomId);

        if (!room) {
            throw RoomErrors.notFound();
        }

        const me = await this.rooms.findMember(roomId, userId);

        if (!me) {
            throw RoomErrors.forbidden();
        }

        const members = await this.rooms.findMembersWithUsers(roomId);

        return {
            items: members.map((m) => ({
                userId: m.userId,
                role: m.role,
                joinedAt: new Date(m.joinedAt).toISOString(),
                isOwner: m.userId === room.ownerId,
                user: m.user,
            })),
        };
    }
}
