import * as path from 'node:path';

import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

import { DATABASE_SERVICE } from './constants';
import { MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } from './database.module-definition';

import type { DatabaseService } from './interfaces';

@Injectable()
export class MigrationService implements OnModuleInit {
    private readonly logger = new Logger(MigrationService.name);

    constructor(
        @Inject(DATABASE_SERVICE)
        private readonly db: DatabaseService,
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: typeof OPTIONS_TYPE,
    ) {}

    async onModuleInit() {
        if (this.options.runMigrations === false) {
            return;
        }

        const migrationsFolder = path.resolve(process.cwd(), 'migrations');

        this.logger.debug('Checking for database migrations...');
        try {
            await migrate(this.db, {
                migrationsFolder,
            });
            this.logger.debug('Migrations completed or already up to date');
        } catch (error) {
            this.logger.error('Migration failed', error);
            process.exit(1);
        }
    }
}
