import type { IRoomRepository } from '@core/rooms/domain/repository';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EgressClient } from 'livekit-server-sdk';

import { RoomErrors } from './room-access';
import { requireRoomPermission } from './room-guard';

export interface StopRecordingInput {
    roomId: string;
    userId: string;
    egressId: string;
}

export interface StopRecordingOutput {
    success: boolean;
}

@Injectable()
export class StopRoomRecordingUseCase {
    constructor(
        private readonly config: ConfigService,
        @Inject('IRoomRepository') private readonly rooms: IRoomRepository,
    ) {}

    async execute({ roomId, userId, egressId }: StopRecordingInput): Promise<StopRecordingOutput> {
        await requireRoomPermission(this.rooms, roomId, userId, 'record');

        const egressClient = new EgressClient(
            this.config.getOrThrow('LIVEKIT_URL'),
            this.config.getOrThrow('LIVEKIT_API_KEY'),
            this.config.getOrThrow('LIVEKIT_API_SECRET'),
            {},
        );

        // EgressId должен принадлежать именно этой комнате, иначе можно остановить чужую запись
        const [egress] = await egressClient.listEgress({ egressId });

        if (!egress || egress.roomName !== roomId) {
            throw RoomErrors.notFound();
        }

        await egressClient.stopEgress(egressId);

        return { success: true };
    }
}
