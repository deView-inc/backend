import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ConfigModule } from '../libs/config/src';
import { DatabaseModule } from '../libs/database/src';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as schema from './shared/entities';

@Module({
    controllers: [AppController],
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
    providers: [AppService],
})
export class AppModule {}
