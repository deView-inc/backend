import {
    CallHandler,
    ExecutionContext,
    HttpStatus,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SKIP_CONTRACT } from '@shared/decorators';
import { BaseException } from '@shared/error';
import { map, Observable } from 'rxjs';
import { z } from 'zod/v4';

export const ZOD_RESPONSE_TOKEN = 'ZOD_RESPONSE_TOKEN';

@Injectable()
export class ZodValidationInterceptor implements NestInterceptor<unknown, unknown> {
    constructor(private readonly reflector: Reflector) {}

    intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> {
        const handler = context.getHandler();
        const metadata = this.reflector.get<{ schema: z.ZodTypeAny } | undefined>(
            ZOD_RESPONSE_TOKEN,
            handler,
        );

        const skipValidation = this.reflector.get<boolean>(SKIP_CONTRACT, handler);

        if (skipValidation) {
            return next.handle();
        }

        const schema = metadata?.schema;

        return next.handle().pipe(
            map((data) => {
                if (!schema) {
                    return data;
                }

                const res = schema.safeParse(data);

                if (!res.success) {
                    const enrichedIssues = res.error.issues.map((issue) => {
                        let receivedValue: unknown = data;

                        for (const key of issue.path) {
                            if (receivedValue !== null && receivedValue !== undefined) {
                                receivedValue = (receivedValue as Record<string, unknown>)[
                                    key as string
                                ];
                            } else {
                                receivedValue = undefined;
                                break;
                            }
                        }

                        return {
                            ...issue,
                            received_value: receivedValue,
                        };
                    });

                    throw new BaseException(
                        {
                            code: 'RESPONSE_VALIDATION_FAILED',
                            message: 'Данные ответа не соответствуют ожидаемому формату',
                            details: enrichedIssues,
                        },
                        HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }

                return res.data;
            }),
        );
    }
}
