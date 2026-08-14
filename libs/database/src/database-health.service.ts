import { Inject, Injectable } from '@nestjs/common';
import { Sql } from 'postgres';

import { SQL_CLIENT } from './constants';

@Injectable()
export class DatabaseHealthService {
    constructor(
        @Inject(SQL_CLIENT)
        private readonly sql: Sql,
    ) {}

    async isAlive() {
        try {
            await this.sql`SELECT 1`;
            return true;
        } catch {
            return false;
        }
    }
}
