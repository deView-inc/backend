import { Injectable } from '@nestjs/common';

import { UpdateNotificationsDto, UpdateProfileDto } from './dtos';
import {
    FindProfileQuery,
    FindPublicProfileQuery,
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
}
