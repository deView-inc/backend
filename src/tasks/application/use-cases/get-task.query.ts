import { TaskErrors } from '@core/tasks/domain/errors';
import type { ITaskRepository } from '@core/tasks/domain/repository';
import { canViewTask } from '@core/tasks/domain/task-access';
import { Inject, Injectable } from '@nestjs/common';

import { toTaskResponse } from '../task-response';

@Injectable()
export class GetTaskQuery {
    constructor(@Inject('ITaskRepository') private readonly tasks: ITaskRepository) {}

    async execute(taskId: string, userId: string) {
        const task = await this.tasks.findById(taskId);

        // Чужую приватную задачу не отличаем от несуществующей, чтобы не раскрывать, что она есть
        if (!task || !canViewTask(task, userId)) {
            throw TaskErrors.notFound();
        }

        return toTaskResponse(task, userId);
    }
}
