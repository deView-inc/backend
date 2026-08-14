import { z } from 'zod/v4';

const domainRegex = /^[a-z0-9.-]+\.[a-z]{2,}$/;

export const ConfigSchema = z.object({
    PORT: z.coerce.number().int({ error: 'Порт (PORT) должен быть числом' }).default(3000),

    NODE_ENV: z
        .enum(['development', 'production', 'test'], {
            error: 'NODE_ENV должен быть одним из значений: development, production, test',
        })
        .default('development'),

    DB_SCHEMA: z
        .string({
            error: 'Не указана схема базы данных (DB_SCHEMA)',
        })
        .min(1, 'Имя схемы DB_SCHEMA не может быть пустым'),

    COOKIE_SECRET: z
        .string({
            error: 'Критическая ошибка: COOKIE_SECRET не задан в окружении',
        })
        .min(10, 'COOKIE_SECRET слишком короткий, должен быть не менее 10 символов'),

    DATABASE_URL: z
        .string({
            error: 'Отсутствует строка подключения DATABASE_URL',
        })
        .url(
            'DATABASE_URL должен быть валидным URL-адресом подключения (например, postgresql://...)',
        ),

    DOMAIN: z
        .string()
        .toLowerCase()
        .regex(domainRegex, {
            message: 'DOMAIN должен быть валидным именем хоста (например, example.com)',
        })
        .optional(),

    STAGE_DOMAIN: z
        .string()
        .toLowerCase()
        .regex(domainRegex, { message: 'STAGE_DOMAIN должен быть валидным именем хоста' })
        .optional(),

    CORS_ALLOWED_ORIGINS: z
        .string({
            error: 'Необходимо указать разрешенные CORS_ALLOWED_ORIGINS (через запятую)',
        })
        .min(1, 'Список CORS_ALLOWED_ORIGINS не может быть пустым')
        .transform((val) => val.split(',').map((s) => s.trim()))
        .pipe(
            z.array(
                z.string().url('Каждая ссылка в CORS_ALLOWED_ORIGINS должна быть валидным URL'),
            ),
        ),
});

export type Config = z.infer<typeof ConfigSchema>;
