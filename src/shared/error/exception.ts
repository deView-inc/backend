import { HttpException, type HttpStatus } from '@nestjs/common';

interface IDetailsOptions {
    readonly target?: string;
    readonly [key: string]: any;
}

export interface IErrorOptions {
    code: string;
    message: string;
    details?: IDetailsOptions[];
}

export class BaseException extends HttpException {
    constructor(options: IErrorOptions, status: HttpStatus) {
        super(options, status);
    }
}

export function isBaseException(error: unknown): error is BaseException {
    return error instanceof BaseException;
}

export function isBaseExceptionWithCode(error: unknown, code: string): error is BaseException {
    return isBaseException(error) && (error.getResponse() as IErrorOptions).code === code;
}
