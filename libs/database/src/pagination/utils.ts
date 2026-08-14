import { asc, desc, type SQL } from 'drizzle-orm';

import { FILTER_MAP } from '../constants';

import type { FilterCondition, SortConfig } from '../interfaces';
import type { PgColumn } from 'drizzle-orm/pg-core';

export const applyFilter = ({ column, operator, value }: FilterCondition): SQL =>
    (FILTER_MAP[operator] ?? FILTER_MAP.eq)(column, value);

export const applyOrder = ({ column, order }: SortConfig): SQL =>
    order === 'desc' ? desc(column) : asc(column);

export const withFallback = <T>(value: T | undefined, fallback: T): T => value ?? fallback;

export const buildConditions = (options: {
    filters?: FilterCondition[];
    search?: { columns: PgColumn[]; value: string };
}): SQL[] => {
    const conditions: SQL[] = [];
    if (options.filters?.length) {
        conditions.push(...options.filters.map(applyFilter));
    }
    // if (options.search?.value && options.search.columns?.length) {
    //     const searchConditions = options.search.columns.map((col) =>
    //         ilike(col, `%${options.search.value}%`),
    //     );
    //     conditions.push(
    //         searchConditions.length === 1 ? searchConditions[0] : or(...searchConditions),
    //     );
    // }
    return conditions;
};

export const getColumnName = (column: PgColumn | string): string =>
    typeof column === 'string' ? column : column.name || 'id';

export const encode = (value: unknown): string => {
    if (value === null) {
        return '';
    }
    return Buffer.from(JSON.stringify(value)).toString('base64');
};

export const decode = (cursor: string): unknown => {
    if (!cursor) {
        return null;
    }
    return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
};
