import { and, gt, lt } from 'drizzle-orm';
import type { PgSelect } from 'drizzle-orm/pg-core';

import type { CursorOptions, CursorResult } from '../interfaces';
import { applyOrder, buildConditions } from './utils';

/**
 * Выполняет курсорную пагинацию на основе уникального поля `id`.
 *
 * **Важно:** Эта реализация работает только с простым курсором — значением поля `id`
 * последнего элемента предыдущей страницы. Составные курсоры и сортировка
 * по не-unique полям (где возможны дубликаты) **не поддерживаются**.
 *
 * @template TRow - Тип строки результата (выводится из запроса)
 *
 * @param {PgSelect} query - Drizzle ORM динамический запрос (`.$dynamic()`)
 * @param {CursorOptions} options - Параметры пагинации
 * @param {PgColumn} options.column - Колонка для сортировки и курсора (должна быть уникальной, обычно `id`)
 * @param {SortConfig} [options.sort] - Объект `{ column, order }` (по умолчанию `{ column: options.column, order: 'asc' }`)
 * @param {number} [options.limit=25] - Количество записей на странице (максимум 50)
 * @param {string} [options.cursor] - Значение `id` последнего элемента предыдущей страницы
 * @param {FilterCondition[]} [options.filters] - Дополнительные условия фильтрации
 * @param {{ columns: PgColumn[]; value: string }} [options.search] - Поисковый запрос
 *
 * @returns {Promise<CursorResult<TRow>>} Объект `{ items, meta: { next, hasNext, limit } }`
 *
 * @example
 * ```ts
 * const result = await paginateCursor(query, {
 *     column: schema.projects.id,
 *     sort: { column: schema.projects.id, order: 'asc' },
 *     limit: 20,
 *     cursor: query.cursor,
 * });
 * ```
 */
export async function paginateCursor<TRow>(
    query: PgSelect,
    options: CursorOptions,
): Promise<CursorResult<TRow>> {
    const MAX_LIMIT = 50,
        DEFAULT_LIMIT = 25,
        limit = Math.min(Math.max(1, options.limit ?? DEFAULT_LIMIT), MAX_LIMIT) + 1,
        sort = options.sort ?? { column: options.column, order: 'asc' as const };
    if (!sort.column) {
        throw new Error('Sort column is required for cursor pagination');
    }

    const conditions = buildConditions(options);

    if (options.cursor) {
        conditions.push(
            sort.order === 'desc'
                ? lt(sort.column, options.cursor)
                : gt(sort.column, options.cursor),
        );
    }

    const orderByClause = applyOrder(sort),
        filteredQuery = conditions.length > 0 ? query.where(and(...conditions)) : query,
        items = await filteredQuery.orderBy(orderByClause).limit(limit),
        hasNext = items.length === limit;

    if (hasNext) {
        items.pop();
    }

    const next = hasNext && items.length > 0 ? String(items[items.length - 1]?.['id']) : null;

    return {
        items: items as TRow[],
        meta: { hasNext, limit: limit - 1, next },
    };
}
