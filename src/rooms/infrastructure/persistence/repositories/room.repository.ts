import type { RoomRole } from '@core/rooms/domain/enums';
import type { IRoomRepository, RoomCreateModel } from '@core/rooms/domain/repository';
import { users } from '@core/user/infrastructure/persistence/models';
import { DATABASE_SERVICE, DatabaseService } from '@libs/database';
import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';

import * as sc from '../models';

@Injectable()
export class RoomRepository implements IRoomRepository {
    constructor(
        @Inject(DATABASE_SERVICE)
        private readonly db: DatabaseService<typeof sc>,
    ) {}

    public create = async (data: RoomCreateModel) =>
        this.db.transaction(async (tx) => {
            const [room] = await tx.insert(sc.rooms).values(data).returning();

            if (!room) {
                throw new Error('never');
            }

            await tx.insert(sc.roomMembers).values({
                roomId: room.id,
                userId: data.ownerId,
                role: 'interviewer',
            });

            return room;
        });

    public findById = async (id: string) => {
        const [row] = await this.db.select().from(sc.rooms).where(eq(sc.rooms.id, id));

        return row ?? null;
    };

    public findMember = async (roomId: string, userId: string) => {
        const [row] = await this.db
            .select()
            .from(sc.roomMembers)
            .where(and(eq(sc.roomMembers.roomId, roomId), eq(sc.roomMembers.userId, userId)));

        return row ?? null;
    };

    public findMembers = async (roomId: string) =>
        this.db.select().from(sc.roomMembers).where(eq(sc.roomMembers.roomId, roomId));

    public findMembersWithUsers = async (roomId: string) => {
        const rows = await this.db
            .select({
                roomId: sc.roomMembers.roomId,
                userId: sc.roomMembers.userId,
                role: sc.roomMembers.role,
                joinedAt: sc.roomMembers.joinedAt,
                username: users.username,
                firstName: users.firstName,
                lastName: users.lastName,
                avatarUrl: users.avatarUrl,
            })
            .from(sc.roomMembers)
            .innerJoin(users, eq(sc.roomMembers.userId, users.id))
            .where(eq(sc.roomMembers.roomId, roomId))
            .orderBy(asc(sc.roomMembers.joinedAt), asc(sc.roomMembers.userId));

        return rows.map(({ username, firstName, lastName, avatarUrl, ...member }) => ({
            ...member,
            user: { username, firstName, lastName, avatarUrl },
        }));
    };

    public setTask = async (roomId: string, taskId: string | null) => {
        const result = await this.db
            .update(sc.rooms)
            .set({ taskId })
            .where(eq(sc.rooms.id, roomId));

        return (result?.count ?? 0) > 0;
    };

    public addMember = async (roomId: string, userId: string, role: RoomRole) => {
        const [row] = await this.db
            .insert(sc.roomMembers)
            .values({ roomId, userId, role })
            .onConflictDoNothing() // Защита от гонки при двойном заходе
            .returning();

        if (row) {
            return row;
        }

        const existing = await this.findMember(roomId, userId);

        if (!existing) {
            throw new Error('never');
        }

        return existing;
    };

    public updateMemberRole = async (roomId: string, userId: string, role: RoomRole) => {
        const result = await this.db
            .update(sc.roomMembers)
            .set({ role })
            .where(and(eq(sc.roomMembers.roomId, roomId), eq(sc.roomMembers.userId, userId)));

        return (result?.count ?? 0) > 0;
    };
}
