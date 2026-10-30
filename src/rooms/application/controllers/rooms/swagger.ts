import { applyDecorators, SetMetadata } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiBadRequest, ApiNotFound as ApiNotFoundErr } from '@shared/error';
import { ZOD_RESPONSE_TOKEN } from '@shared/interceptors';
import { ActionResponse } from '@shared/schemas';

import { StartRecordingResponse, StopRecordingResponse } from '../../dtos/recording.dto';
import {
    CreateRoomResponse,
    JoinRoomResponse,
    RoomDetailsResponse,
    RoomMembersResponse,
    SetRoomTaskResponse,
} from '../../dtos/room-response.dto';
import { RoomTokenResponse } from '../../dtos/room-token.dto';

export const PostRoomTokenSwagger = () =>
    applyDecorators(
        SetMetadata(ZOD_RESPONSE_TOKEN, RoomTokenResponse),
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
        SetMetadata(ZOD_RESPONSE_TOKEN, StartRecordingResponse),
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
        SetMetadata(ZOD_RESPONSE_TOKEN, StopRecordingResponse),
        ApiOperation({
            summary: 'Остановить запись комнаты',
            description: 'Останавливает LiveKit Egress по egressId, полученному при старте записи.',
        }),
        ApiBearerAuth(),
        ApiParam({ name: 'roomId', description: 'Идентификатор комнаты' }),
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

const roomIdParam = () => ApiParam({ name: 'roomId', description: 'Идентификатор комнаты' });

export const PostCreateRoomSwagger = () =>
    applyDecorators(
        SetMetadata(ZOD_RESPONSE_TOKEN, CreateRoomResponse),
        ApiOperation({
            summary: 'Создать комнату',
            description:
                'Создатель сразу становится interviewer. Если taskId не указан, подбирается типовая задача по сложности и языку (если подходящих нет, комната без задачи).',
        }),
        ApiBearerAuth(),
        ApiResponse({ status: 201, type: CreateRoomResponse.Output }),
        ApiBadRequest(),
        ApiNotFoundErr('Выбранной задачи нет или она приватная у другого автора'),
    );

export const PostJoinRoomSwagger = () =>
    applyDecorators(
        SetMetadata(ZOD_RESPONSE_TOKEN, JoinRoomResponse),
        ApiOperation({
            summary: 'Войти в комнату по ссылке',
            description:
                'Открытая комната: новый участник получает viewer. Закрытая: participant. Повторный вход роль не меняет.',
        }),
        ApiBearerAuth(),
        roomIdParam(),
        ApiResponse({ status: 200, type: JoinRoomResponse.Output }),
        ApiNotFoundErr('Комната не найдена'),
        ApiResponse({ status: 410, description: 'Комната уже завершена.' }),
    );

export const GetRoomSwagger = () =>
    applyDecorators(
        SetMetadata(ZOD_RESPONSE_TOKEN, RoomDetailsResponse),
        ApiOperation({
            summary: 'Данные комнаты, моя роль и права, задача',
            description:
                'Только для участников комнаты. Задача, выбранная для комнаты, видна всем участникам, даже если у автора она приватная.',
        }),
        ApiBearerAuth(),
        roomIdParam(),
        ApiResponse({ status: 200, type: RoomDetailsResponse.Output }),
        ApiForbiddenResponse({ description: 'Вы не участник комнаты: сначала POST /join.' }),
        ApiNotFoundErr('Комната не найдена'),
    );

export const GetRoomMembersSwagger = () =>
    applyDecorators(
        SetMetadata(ZOD_RESPONSE_TOKEN, RoomMembersResponse),
        ApiOperation({ summary: 'Участники комнаты и их роли' }),
        ApiBearerAuth(),
        roomIdParam(),
        ApiResponse({ status: 200, type: RoomMembersResponse.Output }),
        ApiForbiddenResponse({ description: 'Вы не участник комнаты.' }),
        ApiNotFoundErr('Комната не найдена'),
    );

export const PatchMemberRoleSwagger = () =>
    applyDecorators(
        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
        ApiOperation({
            summary: 'Выдать роль участнику',
            description:
                'Только у роли с правом assignRoles (interviewer). Интервьюеров может быть несколько. Роль владельца комнаты изменить нельзя.',
        }),
        ApiBearerAuth(),
        roomIdParam(),
        ApiParam({ name: 'userId', description: 'Идентификатор участника' }),
        ApiResponse({ status: 200, type: ActionResponse.Output }),
        ApiBadRequest(),
        ApiForbiddenResponse({ description: 'Нет права выдавать роли или цель: владелец.' }),
        ApiNotFoundErr('Комната или участник не найдены'),
    );

export const PutRoomTaskSwagger = () =>
    applyDecorators(
        SetMetadata(ZOD_RESPONSE_TOKEN, SetRoomTaskResponse),
        ApiOperation({
            summary: 'Выбрать или убрать задачу комнаты',
            description: 'Право manageRoom (interviewer). taskId: null убирает задачу.',
        }),
        ApiBearerAuth(),
        roomIdParam(),
        ApiResponse({ status: 200, type: SetRoomTaskResponse.Output }),
        ApiForbiddenResponse({ description: 'Нет права менять задачу.' }),
        ApiNotFoundErr('Комната или задача не найдены'),
    );
