import { HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBaseController } from '@shared/decorators';
import { BearerAuthGuard } from '@shared/guards';
import type { JwtPayload } from '@shared/types';
import type { FastifyRequest } from 'fastify';

import { RoomsFacade } from '../../rooms.facade';
import { StartRecordingResponse, StopRecordingResponse } from '../dtos/recording.dto';
import { RoomTokenResponse } from '../dtos/room-token.dto';
import {
    PostRoomTokenSwagger,
    PostStartRecordingSwagger,
    PostStopRecordingSwagger,
} from './rooms/swagger';

@ApiBaseController('rooms', 'Rooms')
export class RoomsController {
    constructor(private readonly facade: RoomsFacade) {}

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
    async startRecording(@Param('roomId') roomId: string): Promise<StartRecordingResponse> {
        return this.facade.startRecording({ roomId });
    }

    @Post('record/stop/:egressId')
    @HttpCode(200)
    @UseGuards(BearerAuthGuard)
    @PostStopRecordingSwagger()
    async stopRecording(@Param('egressId') egressId: string): Promise<StopRecordingResponse> {
        return this.facade.stopRecording({ egressId });
    }
}
