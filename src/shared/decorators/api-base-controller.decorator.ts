import { Controller, applyDecorators } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiErrorResponse } from '@shared/error';

export const ApiBaseController = (path: string, tag: string) => {
    const decorators = [
        ApiTags(tag),
        Controller(path),
        ApiErrorResponse(
            500,
            'INTERNAL_SERVER_ERROR',
            'Произошла критическая ошибка на стороне сервера',
        ),
    ].filter((decorator): decorator is Exclude<typeof decorator, null> => decorator !== null);

    return applyDecorators(...decorators);
};
