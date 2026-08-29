import { type ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '@shared/decorators';
import { BaseException } from '@shared/error';
import type { JwtPayload } from '@shared/types';
import type { FastifyRequest } from 'fastify';
import type { Observable } from 'rxjs';

@Injectable()
export class BearerAuthGuard extends AuthGuard('bearer') {
    constructor(private readonly reflector: Reflector) {
        super();
    }

    override canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        try {
            return super.canActivate(context);
        } catch (error) {
            if (this.isPublicOrHasToken(context)) {
                return true;
            }

            throw error;
        }
    }

    override handleRequest<TUser = JwtPayload>(
        err: unknown,
        user: TUser,
        info: unknown,
        context: ExecutionContext,
    ): TUser {
        if (user) {
            return user;
        }

        if (this.isPublicOrHasToken(context)) {
            return null as TUser;
        }

        throw new BaseException(
            {
                code: 'AUTH_FAILED',
                message: 'Доступ запрещен: требуется валидный токен авторизации',
                details: this.getAuthDetails(err, info),
            },
            HttpStatus.UNAUTHORIZED,
        );
    }

    private isPublicOrHasToken(context: ExecutionContext): boolean {
        const { query } = context
            .switchToHttp()
            .getRequest<FastifyRequest<{ readonly Querystring: { readonly token: string } }>>();

        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        return Boolean(isPublic || query.token);
    }

    private getAuthDetails(err: unknown, info: unknown) {
        const infoMessage =
            info && typeof info === 'object' && 'message' in info
                ? (info as { message: string }).message
                : null;

        const errMessage = err instanceof Error ? err.message : null;
        const message = infoMessage || errMessage;

        return message ? [{ target: 'auth', reason: message }] : [];
    }
}
