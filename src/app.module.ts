import { UserModule } from '@core/user';
import { ConfigModule } from '@libs/config';
import { DatabaseModule } from '@libs/database';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { CacheModule } from '@shared/adapters/cache/module';
import { MailModule } from '@shared/adapters/mail';
import { GlobalExceptionFilter } from '@shared/error';
import { ZodValidationInterceptor } from '@shared/interceptors';
import { ZodValidationPipe } from 'nestjs-zod';

import * as schema from './shared/entities';

@Module({
    controllers: [],
    imports: [
        ConfigModule,
        DatabaseModule.registerAsync({
            global: true,
            inject: [ConfigService],
            useFactory: (cfg: ConfigService) => ({
                schema,
                schemaName: cfg.getOrThrow('DB_SCHEMA'),
                logging: true,
            }),
        }),
        CacheModule,
        MailModule,
        UserModule,
    ],
    providers: [
        {
            provide: APP_PIPE,
            useClass: ZodValidationPipe,
        },
        {
            provide: APP_FILTER,
            useClass: GlobalExceptionFilter,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: ZodValidationInterceptor,
        },
    ],
})
export class AppModule {}
