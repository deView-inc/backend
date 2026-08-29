import { Body, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBaseController, GetUserId } from '@shared/decorators';
import { BearerAuthGuard } from '@shared/guards';

import { UpdateProfileDto } from '../../dtos';
import { UserFacade } from '../../user.facade';
import { GetProfileSwagger, GetPublicProfileSwagger, PatchProfileSwagger } from './swagger';

@ApiBaseController('users', 'Account Profile')
export class UserController {
    constructor(private readonly facade: UserFacade) {}

    @Get('me')
    @UseGuards(BearerAuthGuard)
    @GetProfileSwagger()
    async getProfile(@GetUserId() id: string) {
        return this.facade.getProfile(id);
    }

    @Get(':username')
    @GetPublicProfileSwagger()
    async getPublicProfile(@Param('username') username: string) {
        return this.facade.getPublicProfile(username);
    }

    @Patch('me')
    @UseGuards(BearerAuthGuard)
    @PatchProfileSwagger()
    async updateProfile(@Body() dto: UpdateProfileDto, @GetUserId() id: string) {
        return this.facade.updateProfile(id, dto);
    }
}
