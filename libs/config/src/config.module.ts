/* eslint-disable no-console */
import * as path from 'node:path';

import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ZodError } from 'zod/v4';

import { ConfigSchema } from './config.schema';

const validateConfig = (config: Record<string, unknown>) => {
    try {
        return ConfigSchema.parse(config);
    } catch (error) {
        if (error instanceof ZodError) {
            console.group('\nENVIRONMENT_VALIDATION_ERROR\n');

            error.issues.forEach((issue) => {
                const field = issue.path.join('.') || 'ROOT';

                console.group(`Field: ${field}`);
                console.error(`Message: ${issue.message}`);
                console.error(`Code:    ${issue.code.toUpperCase()}`);
                console.groupEnd();
                console.error('\n');
            });

            console.groupEnd();

            throw new Error('Invalid environment configuration', { cause: error });
        }
        throw error;
    }
};

@Module({
    imports: [
        NestConfigModule.forRoot({
            isGlobal: true,
            envFilePath: path.resolve(process.cwd(), '.env'),
            validate: validateConfig,
            validationOptions: {
                abortEarly: true,
            },
        }),
    ],
    exports: [NestConfigModule],
})
export class ConfigModule {}
