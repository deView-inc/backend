import { GetRoomTokenUseCase } from './get-room-token.use-case';
import { StartRoomRecordingUseCase } from './start-room-recording.use-case';
import { StopRoomRecordingUseCase } from './stop-room-recording.use-case';

export * from './get-room-token.use-case';
export * from './start-room-recording.use-case';
export * from './stop-room-recording.use-case';

export const RoomsUseCases = [
    GetRoomTokenUseCase,
    StartRoomRecordingUseCase,
    StopRoomRecordingUseCase,
];
