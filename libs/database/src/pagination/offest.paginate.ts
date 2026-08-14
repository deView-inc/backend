import { and, count } from 'drizzle-orm';

import { applyOrder, buildConditions, withFallback } from './utils';

import type { PaginatedResult, DatabaseService, OffsetOptions } from '../interfaces';
import type { PgSelect } from 'drizzle-orm/pg-core';

export async function paginateOffset<TRow>(
    db: DatabaseService,
    query: PgSelect,
    options: OffsetOptions = {},
): Promise<PaginatedResult<TRow>> {
    const page = withFallback(options.page, 1);
    const limit = Math.min(withFallback(options.limit, 20), 100);
    const offset = withFallback(options.offset, (page - 1) * limit);

    const conditions = buildConditions(options);
    const orderBy = options.sort ? [applyOrder(options.sort)] : [];
    const filtered = conditions.length > 0 ? query.where(and(...conditions)) : query;

    const [data, [totalRow]] = await Promise.all([
        (orderBy.length > 0 ? filtered.orderBy(...orderBy) : filtered).limit(limit).offset(offset),
        db.select({ count: count() }).from(filtered.as('_count')),
    ]);

    const total = Number(totalRow?.count ?? 0);
    const totalPages = Math.ceil(total / limit);

    return {
        items: data as TRow[],
        meta: {
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            total,
            totalPages,
            page,
            limit,
        },
    };
}
