import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { Options, PostgresType } from 'postgres';

export interface DatabaseModuleOptions {
    /**
     * Схема базы данных PostgreSQL (устанавливает `search_path`).
     * * Все запросы без явного указания схемы будут выполняться в этом пространстве имен.
     * @default 'public'
     * @example 'auth_service'
     */
    readonly schemaName?: string;

    /**
     * Объект схемы Drizzle, содержащий определения таблиц и связей.
     * * Рекомендуется импортировать целиком: `import * as schema from './schema'`.
     * @example schema
     */
    readonly schema: Record<string, unknown>;

    /**
     * Настройки драйвера `postgres.js`.
     * * Позволяет настроить пул соединений, таймауты и SSL.
     * * **Внимание:** Параметры отличаются от драйвера `pg`.
     * @see https://github.com/porsager/postgres#options
     * @example { max: 20, idle_timeout: 30, connect_timeout: 5 }
     */
    readonly pool?: Options<{
        [key: string]: PostgresType<any>;
    }>;

    /**
     * Включение или выключение логирования SQL-запросов в консоль через NestJS Logger.
     * @default false
     */
    readonly logging?: boolean;

    /**
     * Флаг для автоматического запуска миграций при старте приложения.
     * * Полезно для локальной разработки и стейджинга.
     * @default true
     */
    readonly runMigrations?: boolean;

    /**
     * Абсолютный путь к директории с файлами миграций (SQL или JS/TS).
     * * Если не указано, используется путь `./migrations` от корня проекта.
     * @default path.resolve(process.cwd(), 'migrations')
     */
    readonly migrationsPath?: string;
}

export type DatabaseSchema = Record<string, unknown>;

/**
 * Тип для внедрения Drizzle ORM в репозитории.
 * Использует драйвер postgres-js под капотом.
 *
 * @example
 * // В репозитории:
 * constructor(
 *   @Inject(DATABASE_SERVICE) private readonly db: DatabaseService<typeof schema>
 * ) {}
 *
 * @template TSchema - Тип вашей схемы данных (например, `typeof schema`).
 */
export type DatabaseService<TSchema extends DatabaseSchema = DatabaseSchema> =
    PostgresJsDatabase<TSchema>;
