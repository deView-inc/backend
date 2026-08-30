import { DATABASE_SERVICE, DatabaseService } from '@libs/database';
import { Inject, Injectable } from '@nestjs/common';
import { eq, and, ne, lt, desc } from 'drizzle-orm';

import { ISessionRepository, type SessionInsert } from '../../../domain/repository';
import * as schema from '../models/session.model';

@Injectable()
export class SessionRepository implements ISessionRepository {
    constructor(
        @Inject(DATABASE_SERVICE)
        private readonly db: DatabaseService<typeof schema>,
    ) {}

    async create(data: SessionInsert) {
        const [result] = await this.db.insert(schema.sessions).values(data).returning();

        if (!result) {
            throw new Error('Failed to create session: no session returned');
        }

        return result;
    }

    async findById(id: string) {
        const [result] = await this.db
            .select()
            .from(schema.sessions)
            .where(and(eq(schema.sessions.id, id), eq(schema.sessions.isRevoked, false)))
            .limit(1);

        return result || null;
    }

    async findAllByUserId(userId: string) {
        return this.db
            .select()
            .from(schema.sessions)
            .where(and(eq(schema.sessions.userId, userId), eq(schema.sessions.isRevoked, false)))
            .orderBy(desc(schema.sessions.createdAt));
    }

    async revoke(id: string) {
        const result = await this.db
            .update(schema.sessions)
            .set({ isRevoked: true, updatedAt: new Date().toISOString() })
            .where(eq(schema.sessions.id, id));

        return (result?.count ?? 0) > 0;
    }

    async revokeAllByUserId(userId: string, exceptSessionId?: string) {
        const filters = [eq(schema.sessions.userId, userId)];

        if (exceptSessionId) {
            filters.push(ne(schema.sessions.id, exceptSessionId));
        }

        await this.db
            .update(schema.sessions)
            .set({ isRevoked: true, updatedAt: new Date().toISOString() })
            .where(and(...filters));
    }

    async deleteExpired() {
        const result = await this.db
            .delete(schema.sessions)
            .where(lt(schema.sessions.expiresAt, new Date().toISOString()));

        return result?.count ?? 0;
    }
}
