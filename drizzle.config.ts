import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './src/shared/entities/index.ts',
    out: './migrations',
    dialect: 'postgresql',
    breakpoints: false,
    casing: 'snake_case',
    strict: true,
    verbose: true,
    dbCredentials: {
        url: process.env['DATABASE_URL']!,
    },
    introspect: { casing: 'camel' },
    schemaFilter: ['*'],
});
