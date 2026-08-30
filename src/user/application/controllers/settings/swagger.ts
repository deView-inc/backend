import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiUnauthorized, ApiValidationError } from '@shared/error';
import { ZOD_RESPONSE_TOKEN } from '@shared/interceptors';
import { ActionResponse } from '@shared/schemas';

import { UpdateNotificationsDto } from '../../dtos';

export const PatchMeNotificationsSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Обновить настройки уведомлений',
            description: 'Частичное обновление настроек email и push уведомлений.',
        }),
        ApiBody({
            type: UpdateNotificationsDto.Output,
        }),
        ApiResponse({
            status: 200,
            description: 'Настройки успешно сохранены.',
        }),
        ApiValidationError('Некорректный формат настроек'),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );
