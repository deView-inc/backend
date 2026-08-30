import { z } from 'zod/v4';

export const requireAnyKey = <T extends z.ZodObject<any>>(schema: T) =>
    schema.refine((data) => Object.keys(data).length > 0, {
        message: 'Необходимо передать хотя бы одно поле для обновления',
    });
