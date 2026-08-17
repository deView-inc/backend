import {
    PreferencesSchema,
    UpdatePreferencesSchema,
} from '@core/user/application/dtos/preferences.dto';
import { USER_GENDERS, USER_GRADES, USER_PRONOUNS } from '@core/user/domain/enums';
import { AvatarResponseSchema } from '@shared/schemas';
import { requireAnyKey } from '@shared/utils/require-any-key.util';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod/v4';

export const UserSchema = z.object({
    id: z
        .string()
        .min(1, 'ID не может быть пустым')
        .describe('Уникальный идентификатор пользователя'),
    email: z.email().describe('Почта пользователя'),
    username: z.string().describe('Юзернейм, например @mikhail_rasputin'),
    firstName: z.string().describe('Имя'),
    lastName: z.string().nullable().describe('Фамилия'),
    displayName: z.string().describe('Имя и фамилия пользователя'),
    occupation: z
        .string()
        .nullable()
        .describe('Краткий заголовок или должность (например: "Frontend developer / TypeScript")'),

    grade: z.enum(USER_GRADES).describe('Уровень пользователя ( "trainee", "junior", etc.)'),
    stack: z
        .array(z.string())
        .describe("Стек пользователя. Например: ['JavaScript', 'TypeScript', 'Go']"),
    bio: z.string().nullable().describe('О себе'),
    avatar: AvatarResponseSchema,
    location: z.string().nullable().describe('Город или страна проживания'),
    gender: z
        .enum(USER_GENDERS)
        .nullable()
        .describe(
            'Пол пользователя: none - не указан, male - мужской, female - женский, non_binary - небинарный, other - другой, prefer_not_to_say - предпочитаю не указывать',
        ),
    pronouns: z
        .enum(USER_PRONOUNS)
        .nullable()
        .describe(
            'Предпочитаемые местоимения: he_him - он/его, she_her - она/ее, they_them - они/их, other - другие, none - не указаны',
        ),
    pronounsCustom: z
        .string()
        .max(50, 'Максимальная длина 50 символов')
        .nullable()
        .optional()
        .describe('Пользовательские местоимения (заполняется, если pronouns = "other")'),
    createdAt: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
            message: 'Строка не является валидной датой',
        })
        .describe('Дата регистрации'),
    updatedAt: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
            message: 'Строка не является валидной датой',
        })
        .describe('Дата последнего обновления профиля'),
});
export class UserDto extends createZodDto(UserSchema) {}

export const CreateUserSchema = UserSchema.omit({
    id: true,
    username: true,
    lastName: true,
    displayName: true,
    occupation: true,
    bio: true,
    location: true,
    gender: true,
    pronouns: true,
    pronounsCustom: true,
    avatar: true,
    createdAt: true,
    updatedAt: true,
}).describe('Схема для создания(регестрации) пользователя');

export class CreateUserDto extends createZodDto(CreateUserSchema) {}

export const UpdateUserSchema = requireAnyKey(
    UserSchema.omit({
        id: true,
        username: true,
        displayName: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
    })
        .partial()
        .describe('Схема для частичного обновления пользователя'),
);
export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}

export const UserProfileSchema = z
    .object({
        profile: UserSchema,
        preferences: PreferencesSchema,
    })
    .describe('Схема профиля пользовател');
export class UserProfileDto extends createZodDto(UserProfileSchema) {}

export const UpdateProfileSchema = requireAnyKey(
    z
        .object({
            profile: UpdateUserSchema,
            preferences: UpdatePreferencesSchema,
        })
        .partial()
        .describe('Схема дл частичного обновления профиля пользователя'),
);

export class UpdateProfileDto extends createZodDto(UpdateProfileSchema) {}
