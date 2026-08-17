import { Injectable } from '@nestjs/common';

import { CreateUserDto, UpdateNotificationsDto, UpdateProfileDto } from './dtos';
import {
    FindProfileQuery,
    FindPublicProfileQuery,
    RegisterUserUseCase,
    UpdateNotificationsUseCase,
    UpdateProfileUseCase,
} from './use-cases';

@Injectable()
export class UserFacade {
    constructor(
        private readonly findProfileQuery: FindProfileQuery,
        private readonly findPublicProfileQuery: FindPublicProfileQuery,
        private readonly updateNotificationsUC: UpdateNotificationsUseCase,
        private readonly updateProfileUC: UpdateProfileUseCase,
        private readonly registration: RegisterUserUseCase,
    ) {}

    public async getProfile(userId: string) {
        return this.findProfileQuery.execute(userId);
    }

    public async getPublicProfile(username: string) {
        return this.findPublicProfileQuery.execute(username);
    }

    public async updateProfile(userId: string, dto: UpdateProfileDto) {
        return this.updateProfileUC.execute(userId, dto);
    }

    public async updateNotifications(userId: string, dto: UpdateNotificationsDto) {
        return this.updateNotificationsUC.execute(userId, dto);
    }

    public async register(dto: CreateUserDto) {
        return this.registration.execute(dto);
    }
}
