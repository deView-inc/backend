import { Injectable } from '@nestjs/common';

import {
    GetRoomTokenUseCase,
    GetRoomTokenInput,
    GetRoomTokenOutput,
    StartRoomRecordingUseCase,
    StartRecordingInput,
    StartRecordingOutput,
    StopRoomRecordingUseCase,
    StopRecordingInput,
    StopRecordingOutput,
} from './application/use-cases';

@Injectable()
export class RoomsFacade {
    constructor(
        private readonly getRoomToken: GetRoomTokenUseCase,
        private readonly startRoomRecording: StartRoomRecordingUseCase,
        private readonly stopRoomRecording: StopRoomRecordingUseCase,
    ) {}

    async getToken(input: GetRoomTokenInput): Promise<GetRoomTokenOutput> {
        return this.getRoomToken.execute(input);
    }

    async startRecording(input: StartRecordingInput): Promise<StartRecordingOutput> {
        return this.startRoomRecording.execute(input);
    }

    async stopRecording(input: StopRecordingInput): Promise<StopRecordingOutput> {
        return this.stopRoomRecording.execute(input);
    }
}
