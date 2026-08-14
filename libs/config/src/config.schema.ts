import { z } from 'zod/v4';

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

    DATABASE_URL: z
        .string({
            error: 'Отсутствует строка подключения DATABASE_URL',
        })
        .url(
            'DATABASE_URL должен быть валидным URL-адресом подключения (например, postgresql://...)',
        ),
});

export type Config = z.infer<typeof ConfigSchema>;
