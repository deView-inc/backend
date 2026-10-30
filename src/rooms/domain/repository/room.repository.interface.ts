import type { RoomDifficulty, RoomLanguage, RoomRole } from '../enums';

export interface RoomRow {
    id: string;
    ownerId: string;
    name: string;
    language: RoomLanguage;
    difficulty: RoomDifficulty;
    isOpen: boolean;
    aiHints: boolean;
    recording: boolean;
    taskId: string | null;
    createdAt: string;
    closedAt: string | null;
}

export interface RoomMemberRow {
    roomId: string;
    userId: string;
    role: RoomRole;
    joinedAt: string;
}

export type RoomMemberView = RoomMemberRow & {
    user: {
        username: string;
        firstName: string;
        lastName: string | null;
        avatarUrl: string | null;
    };
};

export type RoomCreateModel = Omit<RoomRow, 'id' | 'createdAt' | 'closedAt'>;

export interface IRoomRepository {
    /** Создаёт комнату и сразу добавляет владельца как interviewer (в одной транзакции) */
    create(data: RoomCreateModel): Promise<RoomRow>;
    findById(id: string): Promise<RoomRow | null>;
    findMember(roomId: string, userId: string): Promise<RoomMemberRow | null>;
    findMembers(roomId: string): Promise<RoomMemberRow[]>;
    findMembersWithUsers(roomId: string): Promise<RoomMemberView[]>;
    setTask(roomId: string, taskId: string | null): Promise<boolean>;
    addMember(roomId: string, userId: string, role: RoomRole): Promise<RoomMemberRow>;
    updateMemberRole(roomId: string, userId: string, role: RoomRole): Promise<boolean>;
}
