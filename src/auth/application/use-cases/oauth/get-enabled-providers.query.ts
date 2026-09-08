import {
    isOAuthProviderConfigured,
    OAUTH_PROVIDERS,
    OAuthAssets,
} from '@core/auth/infrastructure/constants';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GetEnabledProvidersQuery {
    constructor(private readonly cfg: ConfigService) {}

    async execute() {
        return OAUTH_PROVIDERS.filter((provider) =>
            isOAuthProviderConfigured(provider, this.cfg),
        ).map((provider) => OAuthAssets[provider]);
    }
}
