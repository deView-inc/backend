import { can } from '@core/rooms/domain/enums';
import type { IRoomRepository } from '@core/rooms/domain/repository';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken } from 'livekit-server-sdk';

import { RoomErrors } from './room-access';

export interface GetRoomTokenInput {
    roomId: string;
    userId: string;
    email: string;
}

export interface GetRoomTokenOutput {
    token: string;
    wsUrl: string;
}

@Injectable()
export class GetRoomTokenUseCase {
    constructor(
        private readonly config: ConfigService,
        @Inject('IRoomRepository') private readonly rooms: IRoomRepository,
    ) {}

    async execute({ roomId, userId, email }: GetRoomTokenInput): Promise<GetRoomTokenOutput> {
        const room = await this.rooms.findById(roomId);

        if (!room) {
            throw RoomErrors.notFound();
        }

        if (room.closedAt) {
            throw RoomErrors.closed();
        }

        // Токен только участникам комнаты: сначала POST /rooms/:id/join
        const member = await this.rooms.findMember(roomId, userId);

        if (!member) {
            throw RoomErrors.forbidden();
        }

        const at = new AccessToken(
            this.config.getOrThrow('LIVEKIT_API_KEY'),
            this.config.getOrThrow('LIVEKIT_API_SECRET'),
            { identity: userId, name: email },
        );

        at.addGrant({
            room: roomId,
            roomJoin: true,
            canPublish: can(member.role, 'publishMedia'),
            canPublishData: can(member.role, 'chat'),
            canSubscribe: true,
        });

        return {
            token: await at.toJwt(),
            wsUrl: this.config.getOrThrow('LIVEKIT_PUBLIC_URL'),
        };
    }
}
