import { Body, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiBaseController, GetUserId } from '@shared/decorators';
import { BearerAuthGuard } from '@shared/guards';

import { TasksFacade } from '../../tasks.facade';
import { CreateTaskDto, ListTasksQueryDto, ReportTaskDto, UpdateTaskDto } from '../dtos';
import {
    DeleteTaskSwagger,
    GetTaskSwagger,
    GetTasksSwagger,
    PatchTaskSwagger,
    PostTaskReportSwagger,
    PostTaskSwagger,
} from './tasks/swagger';

@ApiBaseController('tasks', 'Tasks')
@ApiBearerAuth()
@UseGuards(BearerAuthGuard)
export class TasksController {
    constructor(private readonly facade: TasksFacade) {}

    @Get()
    @GetTasksSwagger()
    list(@Query() query: ListTasksQueryDto, @GetUserId() userId: string) {
        return this.facade.list(userId, query);
    }

    @Post()
    @PostTaskSwagger()
    create(@Body() dto: CreateTaskDto, @GetUserId() userId: string) {
        return this.facade.create(userId, dto);
    }

    @Get(':taskId')
    @GetTaskSwagger()
    get(@Param('taskId') taskId: string, @GetUserId() userId: string) {
        return this.facade.get(taskId, userId);
    }

    @Patch(':taskId')
    @PatchTaskSwagger()
    update(
        @Param('taskId') taskId: string,
        @Body() dto: UpdateTaskDto,
        @GetUserId() userId: string,
    ) {
        return this.facade.update(taskId, userId, dto);
    }

    @Delete(':taskId')
    @HttpCode(200)
    @DeleteTaskSwagger()
    remove(@Param('taskId') taskId: string, @GetUserId() userId: string) {
        return this.facade.delete(taskId, userId);
    }

    @Post(':taskId/report')
    @HttpCode(200)
    @PostTaskReportSwagger()
    report(
        @Param('taskId') taskId: string,
        @Body() dto: ReportTaskDto,
        @GetUserId() userId: string,
    ) {
        return this.facade.report(taskId, userId, dto);
    }
}
