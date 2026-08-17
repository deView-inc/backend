import { UserTheme } from '@core/user/domain/enums';
import { userPreferences } from '@core/user/infrastructure/persistence/models';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

type UserPreferencesSelectModel = InferSelectModel<typeof userPreferences>;
type UserPreferencesInsertModel = InferInsertModel<typeof userPreferences>;

export type UserPreferencesUpdateModel = Partial<Omit<UserPreferencesInsertModel, 'userId'>>;

export class UserPreferencesEntity {
    readonly userId: string;

    theme: UserTheme;
    timezone: string;
    language: string;

    constructor(data: UserPreferencesSelectModel) {
        this.userId = data.userId;
        this.theme = data.theme;
        this.timezone = data.timezone;
        this.language = data.language;
    }

    public toJson() {
        return {
            theme: this.theme,
            timezone: this.timezone,
            language: this.language,
        };
    }
}
