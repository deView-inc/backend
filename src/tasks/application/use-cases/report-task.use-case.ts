import { TaskErrors } from '@core/tasks/domain/errors';
import type { ITaskRepository } from '@core/tasks/domain/repository';
import { canViewTask, isTaskAuthor } from '@core/tasks/domain/task-access';
import { Inject, Injectable } from '@nestjs/common';

import type { ReportTaskDto } from '../dtos';

@Injectable()
export class ReportTaskUseCase {
    constructor(@Inject('ITaskRepository') private readonly tasks: ITaskRepository) {}

    async execute(taskId: string, userId: string, dto: ReportTaskDto) {
        const task = await this.tasks.findById(taskId);

        if (!task || !canViewTask(task, userId)) {
            throw TaskErrors.notFound();
        }

        if (task.isOfficial) {
            throw TaskErrors.cannotReportOfficial();
        }

        if (isTaskAuthor(task, userId)) {
            throw TaskErrors.cannotReportOwn();
        }

        // Жаловаться можно только на публичные: приватную чужой пользователь не видит (404 выше)
        const result = await this.tasks.report(taskId, userId, dto.reason, dto.comment ?? null);

        if (result === 'duplicate') {
            throw TaskErrors.alreadyReported();
        }

        return { success: true };
    }
}
