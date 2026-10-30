import type { ITaskRepository } from '@core/tasks/domain/repository';
import { Inject, Injectable } from '@nestjs/common';

import type { CreateTaskDto } from '../dtos';
import { toTaskResponse } from '../task-response';

@Injectable()
export class CreateTaskUseCase {
    constructor(@Inject('ITaskRepository') private readonly tasks: ITaskRepository) {}

    async execute(userId: string, dto: CreateTaskDto) {
        const task = await this.tasks.create({
            authorId: userId,
            title: dto.title,
            description: dto.description,
            difficulty: dto.difficulty,
            language: dto.language ?? null,
            starterCode: dto.starterCode ?? null,
            tags: [...new Set(dto.tags)],
            visibility: dto.visibility,
        });

        return toTaskResponse(task, userId);
    }
}
