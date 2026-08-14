import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ConfigModule } from '../libs/config/src';
import { DatabaseModule } from '../libs/database/src';
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
    ],
    providers: [],
})
export class AppModule {}
