import { applyDecorators } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { RoomTokenResponse } from '../../dtos';
import { StartRecordingResponse, StopRecordingResponse } from '../../dtos/recording.dto';

export const PostRoomTokenSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Получить LiveKit токен для входа в комнату',
        }),
        ApiBearerAuth(),
        ApiParam({
            name: 'roomId',
            description: 'Идентификатор комнаты',
            example: 'interview-123',
        }),
        ApiResponse({
            status: 200,
            description: 'Токен успешно выдан.',
            type: RoomTokenResponse.Output,
        }),
        ApiUnauthorizedResponse({ description: 'Не авторизован.' }),
        ApiForbiddenResponse({ description: 'Нет доступа к комнате.' }),
    );

export const PostStartRecordingSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Начать запись комнаты',
            description:
                'Запускает LiveKit Egress (room composite) и сохраняет запись в mp4. ' +
                'Возвращает egressId, он нужен для остановки записи.',
        }),
        ApiBearerAuth(),
        ApiParam({
            name: 'roomId',
            description: 'Идентификатор комнаты',
            example: 'interview-123',
        }),
        ApiResponse({
            status: 200,
            description: 'Запись запущена.',
            type: StartRecordingResponse.Output,
        }),
        ApiUnauthorizedResponse({ description: 'Не авторизован.' }),
        ApiForbiddenResponse({ description: 'Нет прав запускать запись в этой комнате.' }),
        ApiNotFoundResponse({ description: 'Комната не найдена или не активна.' }),
    );

export const PostStopRecordingSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Остановить запись комнаты',
            description: 'Останавливает LiveKit Egress по egressId, полученному при старте записи.',
        }),
        ApiBearerAuth(),
        ApiParam({
            name: 'egressId',
            description: 'Идентификатор записи (egressId), возвращённый при старте',
            example: 'EG_abc123xyz',
        }),
        ApiResponse({
            status: 200,
            description: 'Запись остановлена.',
            type: StopRecordingResponse.Output,
        }),
        ApiUnauthorizedResponse({ description: 'Не авторизован.' }),
        ApiForbiddenResponse({ description: 'Нет прав останавливать эту запись.' }),
        ApiNotFoundResponse({ description: 'Запись не найдена или уже завершена.' }),
    );
