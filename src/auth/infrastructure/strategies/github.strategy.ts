import { OAuthErrorCodes, OAuthErrorMessages } from '@core/auth/domain/errors';
import { buildOAuthCallbackUrl, OAuthProvider } from '@core/auth/infrastructure/constants';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { BaseException } from '@shared/error';
import { type Profile, Strategy } from 'passport-github';

interface GitHubJsonProfile {
    readonly login: string;
    readonly id: number;
    readonly avatar_url: string;
    readonly name: string | null;
    readonly email: string | null;
    readonly bio: string | null;
}

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github-oauth') {
    constructor(cfg: ConfigService) {
        super({
            clientID: cfg.get('GITHUB_CLIENT_ID') || 'disabled',
            clientSecret: cfg.get('GITHUB_CLIENT_SECRET') || 'disabled',
            callbackURL: buildOAuthCallbackUrl(OAuthProvider.GITHUB, cfg),
            scope: ['user', 'user:email'],
            passReqToCallback: true,
        });
    }

    async validate(
        _req: unknown,
        accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: (err: unknown, user?: unknown) => void,
    ) {
        try {
            const json = profile._json as unknown as GitHubJsonProfile;

            const response = await fetch('https://api.github.com/user/emails', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'User-Agent': 'NestJS-OAuth',
                },
            });

            if (!response.ok) {
                return done(
                    new BaseException(
                        {
                            code: OAuthErrorCodes.AUTHENTICATION_FAILED,
                            message: OAuthErrorMessages[OAuthErrorCodes.AUTHENTICATION_FAILED],
                        },
                        HttpStatus.BAD_GATEWAY,
                    ),
                );
            }

            const emails = (await response.json()) as {
                email: string;
                primary: boolean;
                verified: boolean;
            }[];

            const verifiedEmail =
                emails.find((e) => e.primary && e.verified)?.email ||
                emails.find((e) => e.verified)?.email;

            if (!verifiedEmail) {
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
                id: json.id.toString(),
                email: verifiedEmail,
                first_name: json.name || json.login,
                avatarUrl: json.avatar_url || null,
                bio: json.bio || null,
            };

            done(null, user);
        } catch (error) {
            done(error);
        }
    }
}
