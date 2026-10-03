import { createZodDto } from 'nestjs-zod';
import { z } from 'zod/v4';

export const RoomTokenResponseSchema = z.object({
    token: z.string(),
    wsUrl: z.string(),
});

export class RoomTokenResponse extends createZodDto(RoomTokenResponseSchema) {}
