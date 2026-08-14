import type { PgColumn } from 'drizzle-orm/pg-core';

export type FilterOperator =
    | 'eq'
    | 'ne'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'like'
    | 'ilike'
    | 'in'
    | 'notIn'
    | 'isNull'
    | 'isNotNull';

export interface FilterCondition<TColumn extends PgColumn = PgColumn> {
    column: TColumn;
    operator: FilterOperator;
    value?: unknown;
}

export interface SearchConfig {
    columns: PgColumn[];
    value: string;
}

export interface SortConfig<TColumn extends PgColumn = PgColumn> {
    column: TColumn;
    order: 'asc' | 'desc';
}

export interface OffsetOptions {
    page?: number;
    limit?: number;
    offset?: number;
    sort?: SortConfig;
    filters?: FilterCondition[];
    search?: SearchConfig;
}

export interface CursorOptions {
    column: PgColumn;
    cursor?: string;
    limit?: number;
    sort?: SortConfig;
    filters?: FilterCondition[];
    search?: SearchConfig;
}

export interface PaginatedResult<T> {
    items: T[];
    meta: {
        hasNextPage: boolean;
        hasPrevPage: boolean;
        total: number;
        totalPages: number;
        page: number;
        limit: number;
    };
}

export interface CursorResult<T> {
    items: T[];
    meta: {
        next: string | null;
        limit: number;
        hasNext: boolean;
    };
}
