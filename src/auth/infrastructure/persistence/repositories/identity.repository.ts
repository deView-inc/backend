import { IIdentityRepository } from '@core/auth/domain/repository';
import { OAuthProvider } from '@core/auth/infrastructure/constants';
import { DATABASE_SERVICE, DatabaseService } from '@libs/database';
import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import * as schema from '../models/identity.model';

@Injectable()
export class IdentityRepository implements IIdentityRepository {
    constructor(
        @Inject(DATABASE_SERVICE)
        private readonly db: DatabaseService<typeof schema>,
    ) {}

    public create = async (data: typeof schema.userIdentities.$inferInsert) => {
        const [result] = await this.db.insert(schema.userIdentities).values(data).returning();

        if (!result) {
            throw new Error('Failed to create identity: no identity returned');
        }

        return result;
    };

    public delete = async (id: string) => {
        const result = await this.db
            .delete(schema.userIdentities)
            .where(eq(schema.userIdentities.id, id));

        return result.count.valueOf() > 0;
    };

    public findAllByUserId = async (userId: string) =>
        this.db
            .select()
            .from(schema.userIdentities)
            .where(eq(schema.userIdentities.userId, userId));

    public findByProvider = async (provider: OAuthProvider, providerUserId: string) => {
        const [result] = await this.db
            .select()
            .from(schema.userIdentities)
            .where(
                and(
                    eq(schema.userIdentities.provider, provider),
                    eq(schema.userIdentities.providerUserId, providerUserId),
                ),
            );

        return result ?? null;
    };
}
