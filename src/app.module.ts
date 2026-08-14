import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "../libs/config/src";
import { DatabaseModule } from "../libs/database/src";
import { ConfigService } from "@nestjs/config";
import * as schema from "./shared/entities";

@Module({
  imports: [
    ConfigModule,
    DatabaseModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        schema,
        schemaName: cfg.getOrThrow("DB_SCHEMA"),
        logging: true,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
