import { OAuthProvider } from '@core/auth/infrastructure/constants';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod/v4';

const OAuthResponseSchema = z.object({
    id: z.string(),
    email: z.string().email().nonempty(),
    first_name: z.string().nonempty(),
    avatarUrl: z.string().nullish(),
    bio: z.string().nullish(),
    provider: z.enum(OAuthProvider),
});

export class OAuthResponse extends createZodDto(OAuthResponseSchema) {}

export const ProviderSchema = z.object({
    label: z
        .string()
        .describe(
            'Человекочитаемое название провайдера для отображения на фронтенде (например, "Google", "Яндекс")',
        ),
    value: z
        .string()
        .describe(
            'Системный идентификатор провайдера, используемый в URL и логике бэкенда (например, "google", "yandex")',
        ),
});

export class ProvidersResponse extends createZodDto(z.array(ProviderSchema)) {}

export const ConnectedProviderSchema = z
    .object({
        email: z.string().describe('Email пользователя, полученный от OAuth-провайдера'),
        avatarUrl: z
            .string()
            .nullable()
            .describe(
                'URL аватара пользователя от провайдера (может быть пустым, если провайдер не предоставляет аватар)',
            ),
        provider: z.string().describe('Название OAuth-провайдера (например, "google", "github")'),
        connectedAt: z
            .string()
            .describe('Дата и время привязки провайдера в ISO 8601 формате (UTC)'),
    })
    .describe('Модель привязанного OAuth-провайдера для текущего пользователя');

export class ConnectedProviders extends createZodDto(z.array(ConnectedProviderSchema)) {}

export const ConnectProviderSchema = z.object({
    success: z.boolean().describe('Успешность выполнения запроса'),
    url: z.string().describe('URL для перенаправления на OAuth провайдера'),
});

export class ConnectProviderResponse extends createZodDto(ConnectProviderSchema) {}

export const ExchangeSchema = z.object({
    token: z
        .string()
        .min(32, 'Token must be at least 32 characters')
        .max(128, 'Token must not exceed 128 characters')
        .regex(/^[a-f0-9]+$/, 'Token must be hexadecimal string'),
    provider: z
        .string()
        .describe('Название OAuth-провайдера (например, "google", "github", "facebook")'),
});

export class ExchangeDto extends createZodDto(ExchangeSchema) {}

export type IOAuthExchangeData = z.infer<typeof OAuthResponseSchema> & {
    ip: string | null;
    isNewUser: boolean;
    userId: string | null;
};

export const ExchangeResponseSchema = z.object({
    success: z.boolean().describe('Успешность операции'),
    message: z
        .string()
        .min(1, 'message не может быть пустым')
        .max(255, 'message не длиннее 255 символов')
        .describe('Сообщение для тоста'),
    access: z
        .string()
        .min(10, 'access токен слишком короткий')
        .max(500, 'access токен слишком длинный')
        .describe('JWT access токен'),
    provider: z
        .enum(OAuthProvider, {
            message: 'provider должен быть: google или github',
        })
        .describe('OAuth провайдер'),
});

export class ExchangeResponse extends createZodDto(ExchangeResponseSchema) {}
