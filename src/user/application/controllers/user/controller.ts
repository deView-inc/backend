import { Body, Get, Patch, Post } from '@nestjs/common';
import { ApiBaseController, GetUserId } from '@shared/decorators';

import { CreateUserDto, UpdateProfileDto } from '../../dtos';
import { UserFacade } from '../../user.facade';
import { GetProfileSwagger, PatchProfileSwagger } from './swagger';

@ApiBaseController('users/profile', 'Account Profile')
export class UserController {
    constructor(private readonly facade: UserFacade) {}

    @Get()
    @GetProfileSwagger()
    async getProfile(@GetUserId() id: string) {
        return this.facade.getProfile(id);
    }

    @Patch()
    @PatchProfileSwagger()
    async updateProfile(@Body() dto: UpdateProfileDto, @GetUserId() id: string) {
        return this.facade.updateProfile(id, dto);
    }

    // TODO: move to auth module later
    @Post('reg')
    async register(@Body() dto: CreateUserDto) {
        return this.facade.register(dto);
    }
}
