import { can } from '@core/rooms/domain/enums';
import type { IRoomRepository } from '@core/rooms/domain/repository';
import { Inject, Injectable } from '@nestjs/common';

import type { UpdateMemberRoleDto } from '../dtos';
import { RoomErrors } from './room-access';

@Injectable()
export class UpdateMemberRoleUseCase {
    constructor(@Inject('IRoomRepository') private readonly rooms: IRoomRepository) {}

    async execute(roomId: string, actorId: string, targetId: string, dto: UpdateMemberRoleDto) {
        const room = await this.rooms.findById(roomId);

        if (!room) {
            throw RoomErrors.notFound();
        }

        const actor = await this.rooms.findMember(roomId, actorId);

        if (!actor || !can(actor.role, 'assignRoles')) {
            throw RoomErrors.forbidden();
        }

        // Владельца понижать нельзя, иначе комната останется без управления
        if (targetId === room.ownerId) {
            throw RoomErrors.forbidden();
        }

        const target = await this.rooms.findMember(roomId, targetId);

        if (!target) {
            throw RoomErrors.notFound();
        }

        await this.rooms.updateMemberRole(roomId, targetId, dto.role);

        return { success: true };
    }
}
