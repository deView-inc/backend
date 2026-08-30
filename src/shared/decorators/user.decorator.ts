import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { JwtPayload } from '@shared/types';
import type { FastifyRequest } from 'fastify';

export const GetUser = createParamDecorator(
    (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<FastifyRequest>();
        const { user } = request;
        if (!user) {
            return null;
        }
        return data ? user[data] : user;
    },
);

export const GetUserId = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): string | undefined => {
        const request = ctx.switchToHttp().getRequest<FastifyRequest>();
        const { user } = request;
        return user?.sub;
    },
);
