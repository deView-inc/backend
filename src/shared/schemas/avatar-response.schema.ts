import { z } from 'zod/v4';

export const AvatarResponseSchema = z
    .object({
        small: z.string().url().describe('width: 64'),
        medium: z.string().url().describe('width: 256'),
        large: z.string().url().describe('width: 512'),
        original: z.string().url().describe('width: original'),
    })
    .nullable()
    .describe('Объект с размерами (sm, md, lg, original) или null, если изображение отсутствует');
