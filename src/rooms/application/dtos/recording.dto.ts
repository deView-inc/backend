import { createZodDto } from 'nestjs-zod';
import { z } from 'zod/v4';

export const StartRecordingResponseSchema = z.object({
    egressId: z
        .string()
        .describe('Идентификатор записи LiveKit Egress')
        .meta({ example: 'EG_abc123xyz' }),
});

export class StartRecordingResponse extends createZodDto(StartRecordingResponseSchema) {}

export const StopRecordingResponseSchema = z.object({
    success: z.boolean().describe('Запись успешно остановлена'),
});

export class StopRecordingResponse extends createZodDto(StopRecordingResponseSchema) {}
