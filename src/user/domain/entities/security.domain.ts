import { userSecurity } from '@core/user/infrastructure/persistence/models';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

type UserSecuritySelectModel = InferSelectModel<typeof userSecurity>;
type UserSecurityInsertModel = InferInsertModel<typeof userSecurity>;

export type UserSecurityUpdateModel = Partial<Omit<UserSecurityInsertModel, 'userId'>>;

export class UserSecurityEntity {
    readonly userId: string;

    recoveryEmail: string | null;
    is2faEnabled: boolean;
    twoFactorSecret: string | null;
    lastLoginAt: string | null;

    constructor(data: UserSecuritySelectModel) {
        this.userId = data.userId;
        this.recoveryEmail = data.recoveryEmail;
        this.is2faEnabled = data.is2faEnabled;
        this.twoFactorSecret = data.twoFactorSecret;
        this.lastLoginAt = data.lastLoginAt;
    }

    get isReadyFor2fa(): boolean {
        return this.is2faEnabled && this.twoFactorSecret !== null;
    }

    get hasRecoveryEmail(): boolean {
        return this.recoveryEmail !== null;
    }

    public toJson() {
        return {
            recoveryEmail: this.recoveryEmail,
            is2faEnabled: this.is2faEnabled,
            hasRecoveryEmail: this.hasRecoveryEmail,
            lastLoginAt: this.lastLoginAt,
        };
    }
}
