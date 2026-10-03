/* eslint-disable unicorn/prefer-export-from */
import { GetRoomTokenUseCase } from './get-room-token.use-case';
import { StartRoomRecordingUseCase } from './start-room-recording.use-case';
import { StopRoomRecordingUseCase } from './stop-room-recording.use-case';

export const RoomsUseCases = [
    GetRoomTokenUseCase,
    StartRoomRecordingUseCase,
    StopRoomRecordingUseCase,
];

export { GetRoomTokenUseCase, StartRoomRecordingUseCase, StopRoomRecordingUseCase };

export type { GetRoomTokenInput, GetRoomTokenOutput } from './get-room-token.use-case';

export type { StartRecordingInput, StartRecordingOutput } from './start-room-recording.use-case';

export type { StopRecordingInput, StopRecordingOutput } from './stop-room-recording.use-case';
