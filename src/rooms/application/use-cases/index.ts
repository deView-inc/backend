import { CreateRoomUseCase } from './create-room.use-case';
import { GetRoomTokenUseCase } from './get-room-token.use-case';
import { GetRoomQuery } from './get-room.query';
import { JoinRoomUseCase } from './join-room.use-case';
import { ListRoomMembersQuery } from './list-room-members.query';
import { SetRoomTaskUseCase } from './set-room-task.use-case';
import { StartRoomRecordingUseCase } from './start-room-recording.use-case';
import { StopRoomRecordingUseCase } from './stop-room-recording.use-case';
import { UpdateMemberRoleUseCase } from './update-member-role.use-case';

export * from './create-room.use-case';
export * from './get-room.query';
export * from './get-room-token.use-case';
export * from './join-room.use-case';
export * from './list-room-members.query';
export * from './set-room-task.use-case';
export * from './start-room-recording.use-case';
export * from './stop-room-recording.use-case';
export * from './update-member-role.use-case';

export const RoomsUseCases = [
    CreateRoomUseCase,
    JoinRoomUseCase,
    GetRoomQuery,
    ListRoomMembersQuery,
    SetRoomTaskUseCase,
    UpdateMemberRoleUseCase,
    GetRoomTokenUseCase,
    StartRoomRecordingUseCase,
    StopRoomRecordingUseCase,
];
