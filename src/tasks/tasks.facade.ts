import type { RoomDifficulty, RoomLanguage } from '@core/rooms/domain/enums';
import { Inject, Injectable } from '@nestjs/common';

import type {
    CreateTaskDto,
    ListTasksQueryDto,
    ReportTaskDto,
    UpdateTaskDto,
} from './application/dtos';
import {
    CreateTaskUseCase,
    DeleteTaskUseCase,
    GetTaskQuery,
    ListTasksQuery,
    ReportTaskUseCase,
    UpdateTaskUseCase,
} from './application/use-cases';
import { TaskErrors } from './domain/errors';
import type { ITaskRepository, TaskView } from './domain/repository';
import { canViewTask } from './domain/task-access';

@Injectable()
export class TasksFacade {
    constructor(
        private readonly createTaskUC: CreateTaskUseCase,
        private readonly listTasksQuery: ListTasksQuery,
        private readonly getTaskQuery: GetTaskQuery,
        private readonly updateTaskUC: UpdateTaskUseCase,
        private readonly deleteTaskUC: DeleteTaskUseCase,
        private readonly reportTaskUC: ReportTaskUseCase,
        @Inject('ITaskRepository') private readonly tasks: ITaskRepository,
    ) {}

    create(userId: string, dto: CreateTaskDto) {
        return this.createTaskUC.execute(userId, dto);
    }

    list(userId: string, query: ListTasksQueryDto) {
        return this.listTasksQuery.execute(userId, query);
    }

    get(taskId: string, userId: string) {
        return this.getTaskQuery.execute(taskId, userId);
    }

    update(taskId: string, userId: string, dto: UpdateTaskDto) {
        return this.updateTaskUC.execute(taskId, userId, dto);
    }

    delete(taskId: string, userId: string) {
        return this.deleteTaskUC.execute(taskId, userId);
    }

    report(taskId: string, userId: string, dto: ReportTaskDto) {
        return this.reportTaskUC.execute(taskId, userId, dto);
    }

    // --- для модуля rooms ---

    /** Задача, которую пользователь вправе выбрать для комнаты (иначе 404) */
    async requireVisible(taskId: string, userId: string): Promise<TaskView> {
        const task = await this.tasks.findById(taskId);

        if (!task || !canViewTask(task, userId)) {
            throw TaskErrors.notFound();
        }

        return task;
    }

    /** Задача уже выбрана для комнаты: видят все участники, даже если она приватная у автора */
    findForRoom(taskId: string): Promise<TaskView | null> {
        return this.tasks.findById(taskId);
    }

    pickOfficial(difficulty: RoomDifficulty, language: RoomLanguage): Promise<TaskView | null> {
        return this.tasks.pickOfficial(difficulty, language);
    }
}
