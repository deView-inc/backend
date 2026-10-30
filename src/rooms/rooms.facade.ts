import { Injectable } from '@nestjs/common';

import type { CreateRoomDto, SetRoomTaskDto, UpdateMemberRoleDto } from './application/dtos';
import {
    CreateRoomUseCase,
    GetRoomQuery,
    GetRoomTokenUseCase,
    GetRoomTokenInput,
    GetRoomTokenOutput,
    JoinRoomUseCase,
    ListRoomMembersQuery,
    SetRoomTaskUseCase,
    StartRoomRecordingUseCase,
    StartRecordingInput,
    StartRecordingOutput,
    StopRoomRecordingUseCase,
    StopRecordingInput,
    StopRecordingOutput,
    UpdateMemberRoleUseCase,
} from './application/use-cases';

@Injectable()
export class RoomsFacade {
    constructor(
        private readonly createRoomUC: CreateRoomUseCase,
        private readonly joinRoomUC: JoinRoomUseCase,
        private readonly updateRoleUC: UpdateMemberRoleUseCase,
        private readonly getRoomQuery: GetRoomQuery,
        private readonly listMembersQuery: ListRoomMembersQuery,
        private readonly setTaskUC: SetRoomTaskUseCase,
        private readonly getRoomToken: GetRoomTokenUseCase,
        private readonly startRoomRecording: StartRoomRecordingUseCase,
        private readonly stopRoomRecording: StopRoomRecordingUseCase,
    ) {}

    async createRoom(ownerId: string, dto: CreateRoomDto) {
        return this.createRoomUC.execute(ownerId, dto);
    }

    async joinRoom(roomId: string, userId: string) {
        return this.joinRoomUC.execute(roomId, userId);
    }

    async updateMemberRole(
        roomId: string,
        actorId: string,
        targetId: string,
        dto: UpdateMemberRoleDto,
    ) {
        return this.updateRoleUC.execute(roomId, actorId, targetId, dto);
    }

    async getRoom(roomId: string, userId: string) {
        return this.getRoomQuery.execute(roomId, userId);
    }

    async listMembers(roomId: string, userId: string) {
        return this.listMembersQuery.execute(roomId, userId);
    }

    async setTask(roomId: string, userId: string, dto: SetRoomTaskDto) {
        return this.setTaskUC.execute(roomId, userId, dto);
    }

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
