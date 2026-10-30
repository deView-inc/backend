import { Body, Get, HttpCode, Param, Patch, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBaseController, GetUserId } from '@shared/decorators';
import { BearerAuthGuard } from '@shared/guards';
import type { JwtPayload } from '@shared/types';
import type { FastifyRequest } from 'fastify';

import { RoomsFacade } from '../../rooms.facade';
import { StartRecordingResponse, StopRecordingResponse } from '../dtos/recording.dto';
import { RoomTokenResponse } from '../dtos/room-token.dto';
import { CreateRoomDto, SetRoomTaskDto, UpdateMemberRoleDto } from '../dtos/room.dto';
import {
    GetRoomMembersSwagger,
    GetRoomSwagger,
    PatchMemberRoleSwagger,
    PostCreateRoomSwagger,
    PostJoinRoomSwagger,
    PostRoomTokenSwagger,
    PostStartRecordingSwagger,
    PostStopRecordingSwagger,
    PutRoomTaskSwagger,
} from './rooms/swagger';

@ApiBaseController('rooms', 'Rooms')
export class RoomsController {
    constructor(private readonly facade: RoomsFacade) {}

    @Post()
    @UseGuards(BearerAuthGuard)
    @PostCreateRoomSwagger()
    async createRoom(@Body() dto: CreateRoomDto, @GetUserId() userId: string) {
        return this.facade.createRoom(userId, dto);
    }

    @Get(':roomId')
    @UseGuards(BearerAuthGuard)
    @GetRoomSwagger()
    getRoom(@Param('roomId') roomId: string, @GetUserId() userId: string) {
        return this.facade.getRoom(roomId, userId);
    }

    @Get(':roomId/members')
    @UseGuards(BearerAuthGuard)
    @GetRoomMembersSwagger()
    listMembers(@Param('roomId') roomId: string, @GetUserId() userId: string) {
        return this.facade.listMembers(roomId, userId);
    }

    @Put(':roomId/task')
    @UseGuards(BearerAuthGuard)
    @PutRoomTaskSwagger()
    setTask(
        @Param('roomId') roomId: string,
        @Body() dto: SetRoomTaskDto,
        @GetUserId() userId: string,
    ) {
        return this.facade.setTask(roomId, userId, dto);
    }

    @Post(':roomId/join')
    @HttpCode(200)
    @UseGuards(BearerAuthGuard)
    @PostJoinRoomSwagger()
    async join(@Param('roomId') roomId: string, @GetUserId() userId: string) {
        return this.facade.joinRoom(roomId, userId);
    }

    @Patch(':roomId/members/:userId/role')
    @UseGuards(BearerAuthGuard)
    @PatchMemberRoleSwagger()
    async updateRole(
        @Param('roomId') roomId: string,
        @Param('userId') targetId: string,
        @Body() dto: UpdateMemberRoleDto,
        @GetUserId() actorId: string,
    ) {
        return this.facade.updateMemberRole(roomId, actorId, targetId, dto);
    }

    @Post(':roomId/token')
    @HttpCode(200)
    @UseGuards(BearerAuthGuard)
    @PostRoomTokenSwagger()
    async getToken(
        @Param('roomId') roomId: string,
        @Req() req: FastifyRequest & { user: JwtPayload },
    ): Promise<RoomTokenResponse> {
        return this.facade.getToken({
            roomId,
            userId: req.user.sub,
            email: req.user.email,
        });
    }

    @Post(':roomId/record/start')
    @HttpCode(200)
    @UseGuards(BearerAuthGuard)
    @PostStartRecordingSwagger()
    async startRecording(
        @Param('roomId') roomId: string,
        @GetUserId() userId: string,
    ): Promise<StartRecordingResponse> {
        return this.facade.startRecording({ roomId, userId });
    }

    @Post(':roomId/record/stop/:egressId')
    @HttpCode(200)
    @UseGuards(BearerAuthGuard)
    @PostStopRecordingSwagger()
    async stopRecording(
        @Param('roomId') roomId: string,
        @Param('egressId') egressId: string,
        @GetUserId() userId: string,
    ): Promise<StopRecordingResponse> {
        return this.facade.stopRecording({ roomId, userId, egressId });
    }
}
