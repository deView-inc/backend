import type { ITaskRepository } from '@core/tasks/domain/repository';
import { Inject, Injectable } from '@nestjs/common';

import type { ListTasksQueryDto } from '../dtos';
import { toTaskResponse } from '../task-response';

@Injectable()
export class ListTasksQuery {
    constructor(@Inject('ITaskRepository') private readonly tasks: ITaskRepository) {}

    async execute(userId: string, query: ListTasksQueryDto) {
        const { items, total } = await this.tasks.list({ ...query, userId });
        const totalPages = Math.ceil(total / query.limit);

        // Пустая библиотека это не ошибка: items = [] и total = 0, фронт показывает «Задач пока нет»
        return {
            items: items.map((task) => toTaskResponse(task, userId)),
            meta: {
                total,
                page: query.page,
                limit: query.limit,
                totalPages,
                hasNextPage: query.page < totalPages,
                hasPrevPage: query.page > 1,
            },
        };
    }
}
