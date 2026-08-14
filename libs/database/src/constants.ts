import {
    eq,
    gt,
    gte,
    ilike,
    inArray,
    isNotNull,
    isNull,
    lt,
    lte,
    ne,
    not,
    type SQL,
} from 'drizzle-orm';

import type { FilterOperator } from './interfaces';
import type { PgColumn } from 'drizzle-orm/pg-core';

export const FILTER_MAP: Record<FilterOperator, (col: PgColumn, val?: unknown) => SQL> = {
    eq: (col, val) => eq(col, val),
    ne: (col, val) => ne(col, val),
    gt: (col, val) => gt(col, val),
    gte: (col, val) => gte(col, val),
    lt: (col, val) => lt(col, val),
    lte: (col, val) => lte(col, val),
    like: (col, val) => ilike(col, `%${val}%`),
    ilike: (col, val) => ilike(col, `%${val}%`),
    in: (col, val) => inArray(col, Array.isArray(val) ? val : []),
    notIn: (col, val) => not(inArray(col, Array.isArray(val) ? val : [])),
    isNull: (col) => isNull(col),
    isNotNull: (col) => isNotNull(col),
};

export const DATABASE_SERVICE = 'DATABASE_SERVICE';
export const SQL_CLIENT = 'SQL_CLIENT';
