import {
    UpdateProfileDto,
    UserProfileDto,
    UserPublicProfileDto,
} from '@core/user/application/dtos';
import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiBody, ApiExtraModels, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ApiNotFound, ApiUnauthorized, ApiValidationError } from '@shared/error';
import { ZOD_RESPONSE_TOKEN } from '@shared/interceptors';
import { ActionResponse } from '@shared/schemas';

export const GetProfileSwagger = () =>
    applyDecorators(
        ApiExtraModels(UserProfileDto.Output),
        ApiOperation({
            summary: 'Получить профиль текущего пользователя',
            description:
                'Возвращает полную структуру профиля - данные юзера( имя, грейд, стек...), предпочтения (тема, язык, часовой пояс), статистика.',
        }),
        ApiResponse({
            status: 200,
            description: 'Данные профиля успешно получены.',
            type: UserProfileDto.Output,
        }),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, UserProfileDto),
    );

export const GetPublicProfileSwagger = () =>
    applyDecorators(
        ApiExtraModels(UserPublicProfileDto.Output),
        ApiOperation({
            summary: 'Получить профиль другого пользователя',
            description: 'Возвращает пуличный профиль пользователя( имя, грейд, стек...),',
        }),
        ApiParam({ name: 'username', description: 'Юзернейм пользователя' }),
        ApiResponse({
            status: 200,
            description: 'Данные профиля успешно получены.',
            type: UserPublicProfileDto.Output,
        }),
        ApiNotFound('Пользователь с таким юзернеймом не найден'),

        SetMetadata(ZOD_RESPONSE_TOKEN, UserPublicProfileDto),
    );

export const PatchProfileSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Обновить данные профиля',
            description:
                'Позволяет обновить профиль юзера(имя, bio..) и его предпочтения (часовой пояс, язык интерфейса)',
        }),
        ApiBody({
            type: UpdateProfileDto.Output,
        }),
        ApiResponse({
            status: 200,
            description: 'Профиль успешно обновлен.',
        }),
        ApiValidationError('Ошибка валидации (например, слишком короткое имя)', [
            {
                field: 'fullName',
                message: 'Строка должна содержать минимум 2 символа',
                code: 'too_small',
            },
        ]),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );
