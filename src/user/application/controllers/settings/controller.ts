import { Body, Patch } from '@nestjs/common';
import { ApiBaseController, GetUserId } from '@shared/decorators';

import { UpdateNotificationsDto } from '../../dtos';
import { UserFacade } from '../../user.facade';
import { PatchMeNotificationsSwagger } from './swagger';

@ApiBaseController('users/me', 'Account Settings')
export class UserSettingsController {
    constructor(private readonly facade: UserFacade) {}

    @Patch('notifications')
    @PatchMeNotificationsSwagger()
    async updateNotifications(@Body() settings: UpdateNotificationsDto, @GetUserId() id: string) {
        return this.facade.updateNotifications(id, settings);
    }
}
