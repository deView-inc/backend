import { Module } from '@nestjs/common';

import { TASKS_CONTROLLERS } from './application/controllers';
import { TasksUseCases } from './application/use-cases';
import { TaskRepository } from './infrastructure/persistence/repositories';
import { TasksFacade } from './tasks.facade';

const REPOSITORY = {
    provide: 'ITaskRepository',
    useClass: TaskRepository,
};

@Module({
    controllers: TASKS_CONTROLLERS,
    providers: [...TasksUseCases, TasksFacade, REPOSITORY],
    exports: [TasksFacade],
})
export class TasksModule {}
