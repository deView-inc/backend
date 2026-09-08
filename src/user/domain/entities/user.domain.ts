import { createId } from '@paralleldrive/cuid2';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

import { users } from '../../infrastructure/persistence/models';
import { UserGender, UserGrade, UserPronouns } from '../enums';

type UserSelectModel = InferSelectModel<typeof users>;
type UserInsertModel = InferInsertModel<typeof users>;
export type UserCreateModel = Omit<
    UserInsertModel,
    'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'username'
>;
export type UserUpdateModel = Partial<Omit<UserCreateModel, 'email'>>;

export class UserEntity {
    readonly id: string;
    readonly email: string;

    username: string;
    firstName: string;
    lastName: string | null;
    occupation: string | null;
    location: string | null;
    grade: UserGrade;
    stack: string[];
    bio: string | null;
    gender: UserGender | null;
    pronouns: UserPronouns | null;
    pronounsCustom: string | null;
    avatarUrl: string | null;

    readonly deletedAt: string | null;
    readonly createdAt: string;
    readonly updatedAt: string;

    constructor(data: UserSelectModel) {
        this.id = data.id;
        this.email = data.email;
        this.username = data.username;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.occupation = data.occupation;
        this.location = data.location;
        this.grade = data.grade;
        this.stack = data.stack;
        this.bio = data.bio;
        this.gender = data.gender;
        this.pronouns = data.pronouns;
        this.pronounsCustom = data.pronounsCustom;
        this.avatarUrl = data.avatarUrl;
        this.deletedAt = data.deletedAt;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    private static makeUsername(email: string): string {
        const base = email
            .split('@')[0]!
            .replace(/[^a-zA-Z0-9_]/g, '')
            .slice(0, 40);
        return `${base || 'user'}${createId().slice(0, 6)}`;
    }

    static toCreateModel(input: UserCreateModel): UserInsertModel {
        const email = input.email.trim().toLowerCase();

        return {
            email,
            firstName: input.firstName,
            username: UserEntity.makeUsername(email),
            grade: input.grade || 'trainee',
            stack: input.stack || [],
            avatarUrl: input.avatarUrl || null,
            bio: input.bio || null,
        };
    }

    get fullName(): string {
        return [this.firstName, this.lastName].filter(Boolean).join(' ');
    }

    get isDeleted(): boolean {
        return this.deletedAt !== null;
    }

    get isProfileComplete(): boolean {
        return Boolean(
            this.firstName &&
            this.lastName &&
            this.location &&
            this.bio &&
            this.occupation &&
            this.stack.length &&
            this.gender,
        );
    }

    public toPublicJson() {
        return {
            id: this.id,
            username: this.username,
            displayName: this.fullName,
            firstName: this.firstName,
            lastName: this.lastName,
            bio: this.bio,
            location: this.location,
            avatarUrl: this.avatarUrl,
            occupation: this.occupation,
            grade: this.grade,
            stack: this.stack,
            gender: this.gender,
            pronouns: this.pronouns,
            pronounsCustom: this.pronounsCustom,
            createdAt: this.createdAt,
        };
    }

    public toDetailsJson() {
        return {
            email: this.email,
            ...this.toPublicJson(),
            updatedAt: this.updatedAt,
            isProfileComplete: this.isProfileComplete,
        };
    }

    public toListJson() {
        return {
            id: this.id,
            username: this.username,
            displayName: this.fullName,
            occupation: this.occupation,
            grade: this.grade,
            stack: this.stack,
            avatarUrl: this.avatarUrl,
        };
    }
}
