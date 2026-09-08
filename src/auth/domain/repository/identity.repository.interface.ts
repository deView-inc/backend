import { OAuthProvider } from '../../infrastructure/constants';
import { userIdentities } from '../../infrastructure/persistence/models';

export type IdentityInsert = typeof userIdentities.$inferInsert;
export type IdentitySelect = typeof userIdentities.$inferSelect;

export interface IIdentityRepository {
    create(data: IdentityInsert): Promise<IdentitySelect>;
    findByProvider(provider: OAuthProvider, providerUserId: string): Promise<IdentitySelect | null>;
    findAllByUserId(userId: string): Promise<readonly IdentitySelect[]>;
    delete(id: string): Promise<boolean>;
}
