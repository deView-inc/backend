import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EgressClient } from 'livekit-server-sdk';

export interface StopRecordingInput {
    egressId: string;
}

export interface StopRecordingOutput {
    success: boolean;
}

@Injectable()
export class StopRoomRecordingUseCase {
    constructor(private readonly config: ConfigService) {}

    async execute({ egressId }: StopRecordingInput): Promise<StopRecordingOutput> {
        const egressClient = new EgressClient(
            this.config.getOrThrow('LIVEKIT_URL'),
            this.config.getOrThrow('LIVEKIT_API_KEY'),
            this.config.getOrThrow('LIVEKIT_API_SECRET'),
            {},
        );

        await egressClient.stopEgress(egressId);
        return { success: true };
    }
}
