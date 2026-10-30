import { TaskErrors } from '@core/tasks/domain/errors';
import type { ITaskRepository, TaskUpdateModel } from '@core/tasks/domain/repository';
import { canViewTask, isTaskAuthor } from '@core/tasks/domain/task-access';
import { Inject, Injectable } from '@nestjs/common';

import type { UpdateTaskDto } from '../dtos';
import { toTaskResponse } from '../task-response';

@Injectable()
export class UpdateTaskUseCase {
    constructor(@Inject('ITaskRepository') private readonly tasks: ITaskRepository) {}

    async execute(taskId: string, userId: string, dto: UpdateTaskDto) {
        const task = await this.tasks.findById(taskId);

        if (!task || !canViewTask(task, userId)) {
            throw TaskErrors.notFound();
        }

        // Типовые задачи проекта не редактируются через API
        if (!isTaskAuthor(task, userId)) {
            throw TaskErrors.forbidden();
        }

        // Только переданные поля: недостающие не трогаем
        const patch: TaskUpdateModel = {
            ...(dto.title !== undefined && { title: dto.title }),
            ...(dto.description !== undefined && { description: dto.description }),
            ...(dto.difficulty !== undefined && { difficulty: dto.difficulty }),
            ...(dto.language !== undefined && { language: dto.language }),
            ...(dto.starterCode !== undefined && { starterCode: dto.starterCode }),
            ...(dto.tags !== undefined && { tags: [...new Set(dto.tags)] }),
            ...(dto.visibility !== undefined && { visibility: dto.visibility }),
        };

        const updated = await this.tasks.update(taskId, patch);

        if (!updated) {
            throw TaskErrors.notFound();
        }

        return toTaskResponse(updated, userId);
    }
}
