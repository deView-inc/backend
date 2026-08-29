import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { BaseException } from '@shared/error';
import type { JwtPayload } from '@shared/types';
import type { FastifyRequest } from 'fastify';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class CookieStrategy extends PassportStrategy(Strategy, 'cookie') {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: FastifyRequest) => {
                    const token = request?.cookies?.['refresh'];
                    return token ?? null;
                },
            ]),
            secretOrKey: configService.getOrThrow('JWT_REFRESH_SECRET'),
            passReqToCallback: true,
            ignoreExpiration: false,
            issuer: configService.getOrThrow('JWT_ISSUER'),
            audience: configService.getOrThrow('JWT_AUDIENCE'),
        });
    }

    validate(_req: FastifyRequest, payload: JwtPayload) {
        if (!payload?.jti) {
            throw new BaseException(
                {
                    code: 'INVALID_REFRESH_TOKEN',
                    message: 'Refresh токен невалиден или протух',
                    details: [{ target: 'auth', reason: 'Payload is missing or jti is invalid' }],
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        if (payload.jti?.includes('_access_')) {
            throw new BaseException(
                {
                    code: 'WRONG_TOKEN_TYPE',
                    message: 'Ожидался refresh токен, но получен access',
                    details: [
                        {
                            target: 'auth',
                            reason: 'Token type mismatch',
                        },
                    ],
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        return payload;
    }
}
