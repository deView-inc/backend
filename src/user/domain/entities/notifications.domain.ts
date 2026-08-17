import { NotificationSettings } from '@core/user/domain/enums';
import { userNotifications } from '@core/user/infrastructure/persistence/models';
import { InferSelectModel } from 'drizzle-orm';

type UserNotificationsSelectModel = InferSelectModel<typeof userNotifications>;

export class UserNotificationsEntity {
    readonly userId: string;
    settings: NotificationSettings;

    constructor(data: UserNotificationsSelectModel) {
        this.userId = data.userId;
        this.settings = data.settings;
    }

    public toJson() {
        return this.settings;
    }
}
