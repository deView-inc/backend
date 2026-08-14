import { DatabaseHealthService } from './database-health.service';
import { Inject, Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { DATABASE_SERVICE, SQL_CLIENT } from './constants';
import {
    ConfigurableModuleClass,
    MODULE_OPTIONS_TOKEN,
    OPTIONS_TYPE,
} from './database.module-definition';
import { MigrationService } from './migration.service';

@Module({
    providers: [
        MigrationService,
        DatabaseHealthService,
        {
            provide: SQL_CLIENT,
            inject: [ConfigService, MODULE_OPTIONS_TOKEN],
            useFactory: (configService: ConfigService, opts: typeof OPTIONS_TYPE) => {
                const baseUrl = configService.getOrThrow<string>('DATABASE_URL');
                const url = new URL(baseUrl);

                if (opts.schemaName) {
                    url.searchParams.set('options', `-c search_path=${opts.schemaName}`);
                }

                return postgres(url.toString(), {
                    onnotice: (msg) => new Logger('PostgresJS').verbose(msg),
                    backoff: (attempt) => Math.min(attempt * 100, 3000),
                    target_session_attrs: 'read-write',
                    publications: 'alltables',
                    connect_timeout: 2,
                    idle_timeout: 5,
                    max_lifetime: 60 * 60,
                    keep_alive: 30,
                    transform: {
                        undefined: null,
                    },
                    ...opts.pool,
                });
            },
        },
        {
            provide: DATABASE_SERVICE,
            inject: [SQL_CLIENT, MODULE_OPTIONS_TOKEN],
            useFactory: (sql: postgres.Sql, opts: typeof OPTIONS_TYPE) => {
                const logger = new Logger('Drizzle');

                return drizzle(sql, {
                    schema: opts.schema,
                    logger: opts.logging
                        ? {
                              logQuery(query, params) {
                                  logger.debug(`SQL: ${query}`);
                                  if (params?.length) {
                                      logger.debug(`Params: ${JSON.stringify(params)}`);
                                  }
                              },
                          }
                        : false,
                });
            },
        },
    ],
    exports: [DATABASE_SERVICE, DatabaseHealthService],
})
export class DatabaseModule extends ConfigurableModuleClass implements OnApplicationShutdown {
    private readonly logger = new Logger(DatabaseModule.name);

    constructor(
        @Inject(SQL_CLIENT)
        private readonly sql: postgres.Sql,
    ) {
        super();
    }

    async onApplicationShutdown() {
        this.logger.log('Closing database connections...');
        await this.sql.end();
    }
}
