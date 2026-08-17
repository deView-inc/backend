import { UpdateProfileDto, UserProfileDto } from '@core/user/application/dtos';
import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiBody, ApiExtraModels, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiUnauthorized, ApiValidationError } from '@shared/error';
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
