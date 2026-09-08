import { OAuthErrorCodes, OAuthErrorMessages } from '@core/auth/domain/errors';
import { buildOAuthCallbackUrl, OAuthProvider } from '@core/auth/infrastructure/constants';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { BaseException } from '@shared/error';
import { type Profile, Strategy, type VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google-oauth') {
    constructor(cfg: ConfigService) {
        super({
            clientID: cfg.get('GOOGLE_CLIENT_ID') || 'disabled',
            clientSecret: cfg.get('GOOGLE_CLIENT_SECRET') || 'disabled',
            scope: ['email', 'profile'],
            callbackURL: buildOAuthCallbackUrl(OAuthProvider.GOOGLE, cfg),
            passReqToCallback: true,
        });
    }

    validate(_r: never, _at: string, _rt: string, profile: Profile, done: VerifyCallback) {
        const json = profile._json;

        const isVerified = json.email_verified === true;

        if (!isVerified || !json.email) {
            return done(
                new BaseException(
                    {
                        code: OAuthErrorCodes.EMAIL_NOT_VERIFIED,
                        message: OAuthErrorMessages[OAuthErrorCodes.EMAIL_NOT_VERIFIED],
                    },
                    HttpStatus.FORBIDDEN,
                ),
            );
        }

        const user = {
            id: profile.id,
            email: json.email,
            avatarUrl: json.picture || null,
            first_name: json.given_name,
        };

        done(null, user);
    }
}
