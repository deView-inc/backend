import { CreateTaskUseCase } from './create-task.use-case';
import { DeleteTaskUseCase } from './delete-task.use-case';
import { GetTaskQuery } from './get-task.query';
import { ListTasksQuery } from './list-tasks.query';
import { ReportTaskUseCase } from './report-task.use-case';
import { UpdateTaskUseCase } from './update-task.use-case';

export * from './create-task.use-case';
export * from './delete-task.use-case';
export * from './get-task.query';
export * from './list-tasks.query';
export * from './report-task.use-case';
export * from './update-task.use-case';

export const TasksUseCases = [
    CreateTaskUseCase,
    ListTasksQuery,
    GetTaskQuery,
    UpdateTaskUseCase,
    DeleteTaskUseCase,
    ReportTaskUseCase,
];
