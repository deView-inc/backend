import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { BaseException } from '@shared/error';
import type { JwtPayload } from '@shared/types';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy, 'bearer') {
    constructor(cfg: ConfigService) {
        const audience = cfg.getOrThrow('JWT_AUDIENCE');

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: cfg.getOrThrow('JWT_ACCESS_SECRET'),
            issuer: cfg.getOrThrow('JWT_ISSUER'),
            audience,
            ignoreExpiration: false,
            jsonWebTokenOptions: { clockTolerance: 30 },
        });
    }

    validate(payload: JwtPayload) {
        if (!payload?.jti) {
            throw new BaseException(
                {
                    code: 'INVALID_ACCESS_TOKEN',
                    message: 'Access токен невалиден или протух',
                    details: [
                        {
                            target: 'auth',
                            reason: 'Payload is missing or jti is invalid',
                        },
                    ],
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        if (!payload.jti.includes('_access_')) {
            throw new BaseException(
                {
                    code: 'WRONG_TOKEN_TYPE',
                    message: 'Ожидался access токен',
                    details: [
                        {
                            target: 'auth',
                            reason: 'Token type mismatch. Access token required.',
                        },
                    ],
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        return payload;
    }
}
