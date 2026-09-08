import { USER_THEMES } from '@core/user/domain/enums';
import { requireAnyKey } from '@shared/utils/require-any-key.util';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const PreferencesSchema = z.object({
    timezone: z
        .string()
        .max(50)
        .describe('Временная зона пользователя (например: "Europe/Moscow", "UTC+3")'),
    language: z.string().max(5).describe('Язык интерфейса (ISO 639-1: "ru", "en", "de" и т.д.)'),
    theme: z
        .enum(USER_THEMES)
        .describe('Тема оформления: light - светлая, dark - темная, system - как в системе'),
});
export class PreferencesDto extends createZodDto(PreferencesSchema) {}

export const UpdatePreferencesSchema = requireAnyKey(
    PreferencesSchema.partial().describe('Схема для частичного обновления предпочтений юзера'),
);
export class UpdatePreferencesDto extends createZodDto(UpdatePreferencesSchema) {}
