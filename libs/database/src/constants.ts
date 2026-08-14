import {
    type SQL,
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
} from 'drizzle-orm';
import type { PgColumn } from 'drizzle-orm/pg-core';

import type { FilterOperator } from './interfaces';

export const FILTER_MAP: Record<FilterOperator, (col: PgColumn, val?: unknown) => SQL> = {
    eq: (col, val) => eq(col, val),
    gt: (col, val) => gt(col, val),
    gte: (col, val) => gte(col, val),
    ilike: (col, val) => ilike(col, `%${val}%`),
    in: (col, val) => inArray(col, Array.isArray(val) ? val : []),
    isNotNull: (col) => isNotNull(col),
    isNull: (col) => isNull(col),
    like: (col, val) => ilike(col, `%${val}%`),
    lt: (col, val) => lt(col, val),
    lte: (col, val) => lte(col, val),
    ne: (col, val) => ne(col, val),
    notIn: (col, val) => not(inArray(col, Array.isArray(val) ? val : [])),
};

export const DATABASE_SERVICE = 'DATABASE_SERVICE';
export const SQL_CLIENT = 'SQL_CLIENT';
