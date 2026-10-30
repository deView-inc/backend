import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ApiBadRequest, ApiConflict, ApiForbidden, ApiNotFound } from '@shared/error';
import { ZOD_RESPONSE_TOKEN } from '@shared/interceptors';
import { ActionResponse } from '@shared/schemas';

import { TaskListResponse, TaskResponse } from '../../dtos';

const taskIdParam = () => ApiParam({ name: 'taskId', description: 'Идентификатор задачи' });

export const GetTasksSwagger = () =>
    applyDecorators(
        SetMetadata(ZOD_RESPONSE_TOKEN, TaskListResponse),
        ApiOperation({
            summary: 'Библиотека задач',
            description:
                'scope=all (по умолчанию): типовые и публичные задачи сообщества; official: типовые; community: сообщества; mine: мои, в том числе приватные. Если задач нет, items = [].',
        }),
        ApiResponse({ status: 200, type: TaskListResponse.Output }),
        ApiBadRequest(),
    );

export const PostTaskSwagger = () =>
    applyDecorators(
        SetMetadata(ZOD_RESPONSE_TOKEN, TaskResponse),
        ApiOperation({
            summary: 'Создать свою задачу',
            description: 'visibility=private: только автору; public: попадает в общую библиотеку.',
        }),
        ApiResponse({ status: 201, type: TaskResponse.Output }),
        ApiBadRequest(),
    );

export const GetTaskSwagger = () =>
    applyDecorators(
        SetMetadata(ZOD_RESPONSE_TOKEN, TaskResponse),
        ApiOperation({ summary: 'Получить задачу' }),
        taskIdParam(),
        ApiResponse({ status: 200, type: TaskResponse.Output }),
        ApiNotFound('Задачи нет или она приватная у другого автора'),
    );

export const PatchTaskSwagger = () =>
    applyDecorators(
        SetMetadata(ZOD_RESPONSE_TOKEN, TaskResponse),
        ApiOperation({ summary: 'Изменить свою задачу' }),
        taskIdParam(),
        ApiResponse({ status: 200, type: TaskResponse.Output }),
        ApiBadRequest(),
        ApiForbidden('Менять можно только свои задачи'),
        ApiNotFound(),
    );

export const DeleteTaskSwagger = () =>
    applyDecorators(
        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
        ApiOperation({
            summary: 'Удалить свою задачу',
            description: 'Комнаты, где задача была выбрана, остаются, но уже без задачи.',
        }),
        taskIdParam(),
        ApiResponse({ status: 200, type: ActionResponse.Output }),
        ApiForbidden('Удалять можно только свои задачи'),
        ApiNotFound(),
    );

export const PostTaskReportSwagger = () =>
    applyDecorators(
        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
        ApiOperation({
            summary: 'Пожаловаться на публичную задачу',
            description:
                'Одна жалоба от пользователя на задачу. Нельзя жаловаться на свою и на типовые задачи. После 5 жалоб задача скрывается из общей библиотеки.',
        }),
        taskIdParam(),
        ApiResponse({ status: 200, type: ActionResponse.Output }),
        ApiBadRequest('Жалоба на свою или на типовую задачу'),
        ApiNotFound(),
        ApiConflict('Вы уже жаловались на эту задачу'),
    );
