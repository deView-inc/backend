import 'dotenv/config';
import type { ThrottlerModuleOptions } from '@nestjs/throttler';

export const DEFAULT_THROTTLER_OPTIONS: ThrottlerModuleOptions = [
    {
        limit: process.env['THROTTLE_LIMIT'] ? parseInt(process.env['THROTTLE_LIMIT']) : 100,
        skipIf: (context) => context.getType() !== 'http',
        ttl: process.env['THROTTLE_TTL'] ? parseInt(process.env['THROTTLE_LIMIT'] ?? '') : 60_000,
    },
];
