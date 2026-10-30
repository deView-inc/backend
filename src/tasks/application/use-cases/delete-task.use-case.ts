import { TaskErrors } from '@core/tasks/domain/errors';
import type { ITaskRepository } from '@core/tasks/domain/repository';
import { canViewTask, isTaskAuthor } from '@core/tasks/domain/task-access';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteTaskUseCase {
    constructor(@Inject('ITaskRepository') private readonly tasks: ITaskRepository) {}

    async execute(taskId: string, userId: string) {
        const task = await this.tasks.findById(taskId);

        if (!task || !canViewTask(task, userId)) {
            throw TaskErrors.notFound();
        }

        if (!isTaskAuthor(task, userId)) {
            throw TaskErrors.forbidden();
        }

        await this.tasks.delete(taskId);

        return { success: true };
    }
}
