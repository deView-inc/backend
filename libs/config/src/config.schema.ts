import { z } from 'zod/v4';

const domainRegex = /^[a-z0-9.-]+\.[a-z]{2,}$/;

export const ConfigSchema = z.object({
    PORT: z.coerce.number().int({ error: 'Порт (PORT) должен быть числом' }).default(3000),

    NODE_ENV: z
        .enum(['development', 'production', 'test'], {
            error: 'NODE_ENV должен быть одним из значений: development, production, test',
        })
        .default('development'),

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

    /* DATABASE */
    DB_SCHEMA: z
        .string({
            error: 'Не указана схема базы данных (DB_SCHEMA)',
        })
        .min(1, 'Имя схемы DB_SCHEMA не может быть пустым'),

    DATABASE_URL: z
        .string({
            error: 'Отсутствует строка подключения DATABASE_URL',
        })
        .url(
            'DATABASE_URL должен быть валидным URL-адресом подключения (например, postgresql://...)',
        ),

    COOKIE_SECRET: z
        .string({
            error: 'Критическая ошибка: COOKIE_SECRET не задан в окружении',
        })
        .min(10, 'COOKIE_SECRET слишком короткий, должен быть не менее 10 символов'),

    /* REDIS */
    REDIS_HOST: z.string().default('redis'),
    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_PASSWORD: z.string().optional(),

    /* MAIL */
    MAIL_HOST: z
        .string({
            error: 'Адрес почтового сервера (MAIL_HOST) не указан',
        })
        .min(1, 'MAIL_HOST не может быть пустым'),

    MAIL_PORT: z.coerce
        .number({
            error: 'Порт почтового сервера (MAIL_PORT) не указан',
        })
        .int({ error: 'MAIL_PORT должен быть числом' }),

    MAIL_USER: z
        .string({
            error: 'Имя пользователя почты (MAIL_USER) не указано',
        })
        .email('MAIL_USER должен быть валидным email-адресом'),

    MAIL_PASSWORD: z
        .string({
            error: 'Пароль от почты (MAIL_PASSWORD) обязателен',
        })
        .min(1, 'Пароль от почты не может быть пустым'),

    MAIL_FROM_NAME: z
        .string({
            error: 'Имя отправителя (MAIL_FROM_NAME) не указано',
        })
        .min(1, 'Имя отправителя не может быть пустым'),

    MAIL_FROM_EMAIL: z.string().email('Неверный формат email в MAIL_FROM_EMAIL').optional(),

    /* S3 */
    S3_BUCKET_NAME: z
        .string({
            error: "Имя бакета S3_BUCKET_NAME обязательно. Пример: 'avatars'",
        })
        .min(1, 'Имя бакета не может быть пустым'),

    S3_ENDPOINT: z
        .string({
            error: "S3_ENDPOINT обязателен. Пример: 'http://localhost:9000'",
        })
        .url('S3_ENDPOINT должен быть валидным URL-адресом'),
});

export type Config = z.infer<typeof ConfigSchema>;
