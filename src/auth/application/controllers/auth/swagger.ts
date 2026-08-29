import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import {
    ApiBadRequest,
    ApiConflict,
    ApiForbidden,
    ApiNotFound,
    ApiTooManyRequests,
    ApiUnauthorized,
    ApiValidationError,
} from '@shared/error';
import { ZOD_RESPONSE_TOKEN } from '@shared/interceptors';
import { ActionResponse } from '@shared/schemas';

import {
    SignInDto,
    SignResponse,
    SignUpDto,
    VerifyDto,
    SessionsResponse,
    SessionResponse,
    ResendCodeDto,
    ResendCodeResponse,
} from '../../dtos';

export const PostRegisterSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Регистрация нового пользователя',
            description: 'Создает пользователя, базовые настройки безопасности и уведомлений.',
        }),
        ApiBody({ type: SignUpDto.Output }),
        ApiResponse({
            status: 201,
            description: 'Пользователь успешно зарегистрирован.',
            type: ActionResponse.Output,
        }),
        ApiValidationError('Ошибка валидации данных (например, неверный формат email)'),
        ApiConflict('Пользователь с таким email уже существует'),

        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );

export const PostLoginSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Вход в систему',
            description:
                'Возвращает Access/Refresh токены. Если у пользователя включена 2FA, вернет временный токен.',
        }),
        ApiBody({ type: SignInDto.Output }),
        ApiResponse({
            status: 200,
            description: 'Успешный вход.',
            type: SignResponse.Output,
        }),
        ApiBadRequest('Неверный формат email'),
        ApiUnauthorized('Неверный email или пароль'),

        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );

export const PostLoginVerifySwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Вход в систему',
            description:
                'Возвращает Access/Refresh токены. Если у пользователя включена 2FA, вернет временный токен.',
        }),
        ApiBody({ type: VerifyDto.Output }),
        ApiResponse({
            status: 200,
            description: 'Успешный вход.',
            type: SignResponse.Output,
        }),
        ApiBadRequest('Неверный формат email'),
        ApiUnauthorized('Неверный email или пароль'),

        SetMetadata(ZOD_RESPONSE_TOKEN, SignResponse),
    );

export const PostRefreshSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Обновление токенов',
            description: 'Выдает новую пару Access и Refresh токенов.',
        }),
        ApiResponse({
            status: 200,
            description: 'Токены успешно обновлены.',
            type: SignResponse.Output,
        }),
        ApiBadRequest('Ошибка валидации (не передан refresh токен)'),
        ApiUnauthorized('Refresh токен недействителен, истек или отозван'),

        SetMetadata(ZOD_RESPONSE_TOKEN, SignResponse),
    );

export const PostLogoutSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Выход из системы',
            description: 'Удаляет текущую сессию пользователя из Redis.',
        }),
        ApiResponse({ status: 200, description: 'Успешный выход.', type: ActionResponse.Output }),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );

export const PostSignUpConfirmSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Подтверждение регистрации по коду',
            description:
                'Проверяет OTP из письма, создаёт аккаунт, выдаёт access-токен в теле ответа и устанавливает refresh в httpOnly cookie.',
        }),
        ApiBody({ type: VerifyDto.Output }),
        ApiResponse({
            status: 201,
            description: 'Аккаунт подтверждён, сессия создана.',
            type: SignResponse.Output,
        }),
        ApiValidationError('Ошибка валидации (неверный формат email или длина кода)'),
        ApiBadRequest('Срок регистрации истёк или сессия не найдена'),
        ApiBadRequest('Неверный или истёкший код подтверждения'),

        SetMetadata(ZOD_RESPONSE_TOKEN, SignResponse),
    );

export const GetSessionsSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Получить активные сессии',
            description: 'Возвращает список всех активных устройств/сессий пользователя.',
        }),
        ApiResponse({
            status: 200,
            description: 'Список сессий успешно получен.',
            type: [SessionResponse.Output],
        }),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, SessionsResponse),
    );

export const DeleteSessionSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Завершить чужую сессию',
            description: 'Принудительно удаляет указанную сессию из Redis.',
        }),
        ApiParam({ name: 'cuid', description: 'ID сессии, которую нужно завершить' }),
        ApiResponse({
            status: 200,
            description: 'Сессия успешно завершена.',
            type: ActionResponse.Output,
        }),
        ApiUnauthorized(),
        ApiForbidden(),
        ApiNotFound('Сессия не найдена или уже истекла'),
        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );

export const ResendCodeSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Повторная отправка кода подтверждения',
            description:
                'Отправляет новый код подтверждения на email, связанный с текущей сессией регистрации или сброса пароля.',
        }),
        ApiBody({ type: ResendCodeDto.Output }),
        ApiResponse({
            status: 200,
            description: 'Код успешно отправлен.',
            type: ResendCodeResponse.Output,
        }),
        ApiBadRequest('Неверный формат email'),
        ApiNotFound('Сессия регистрации или сброса пароля не найдена или истекла'),
        ApiTooManyRequests('Превышено количество попыток запроса нового кода на email'),

        SetMetadata(ZOD_RESPONSE_TOKEN, ResendCodeResponse),
    );
