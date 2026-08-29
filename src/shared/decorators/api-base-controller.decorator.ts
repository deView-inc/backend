import { Controller, applyDecorators, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiErrorResponse } from '@shared/error';
import { BearerAuthGuard } from '@shared/guards';

export const ApiBaseController = (path: string, tag: string, hasJWTGuard?: boolean) => {
    const decorators = [
        ApiTags(tag),
        Controller(path),
        hasJWTGuard ? UseGuards(BearerAuthGuard) : null,
        ApiErrorResponse(
            500,
            'INTERNAL_SERVER_ERROR',
            'Произошла критическая ошибка на стороне сервера',
        ),
    ].filter((decorator): decorator is Exclude<typeof decorator, null> => decorator !== null);

    return applyDecorators(...decorators);
};
