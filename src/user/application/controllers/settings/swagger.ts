import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiUnauthorized, ApiValidationError } from '@shared/error';

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
        new ApiValidationError('Некорректный формат настроек'),
        ApiUnauthorized(),
    );
