import { and, count } from 'drizzle-orm';
import type { PgSelect } from 'drizzle-orm/pg-core';

import type { DatabaseService, OffsetOptions, PaginatedResult } from '../interfaces';
import { applyOrder, buildConditions, withFallback } from './utils';

export async function paginateOffset<TRow>(
    db: DatabaseService,
    query: PgSelect,
    options: OffsetOptions = {},
): Promise<PaginatedResult<TRow>> {
    const page = withFallback(options.page, 1),
        limit = Math.min(withFallback(options.limit, 20), 100),
        offset = withFallback(options.offset, (page - 1) * limit),
        conditions = buildConditions(options),
        orderBy = options.sort ? [applyOrder(options.sort)] : [],
        filtered = conditions.length > 0 ? query.where(and(...conditions)) : query,
        [data, [totalRow]] = await Promise.all([
            (orderBy.length > 0 ? filtered.orderBy(...orderBy) : filtered)
                .limit(limit)
                .offset(offset),
            db.select({ count: count() }).from(filtered.as('_count')),
        ]),
        total = Number(totalRow?.count ?? 0),
        totalPages = Math.ceil(total / limit);

    return {
        items: data as TRow[],
        meta: {
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            limit,
            page,
            total,
            totalPages,
        },
    };
}
