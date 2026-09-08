import { OAuthProvider } from '@core/auth/infrastructure/constants';
import { getDeviceMeta } from '@core/auth/infrastructure/utils';
import {
    Body,
    Delete,
    Get,
    HttpCode,
    Param,
    Post,
    Query,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { ApiBaseController, GetUserId, SkipContract } from '@shared/decorators';
import { BearerAuthGuard, OAuthGuard } from '@shared/guards';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { AuthFacade } from '../../auth.facade';
import { ExchangeDto } from '../../dtos';
import {
    DisconnectOAuthProviderSwagger,
    GetConnectedProvidersSwagger,
    ConnectOAuthProviderSwagger,
    GetOAuthProvidersSwagger,
    OAuthCallbackSwagger,
    OAuthLoginSwagger,
    ExchangeSwagger,
} from './swagger';

@ApiBaseController('oauth', 'OAuth')
export class OAuthController {
    constructor(private readonly facade: AuthFacade) {}

    @Get(':provider')
    @OAuthLoginSwagger()
    @UseGuards(OAuthGuard)
    @SkipContract()
    async oauthLogin() {}

    @Get(':provider/callback')
    @OAuthCallbackSwagger()
    @UseGuards(OAuthGuard)
    @SkipContract()
    @HttpCode(302)
    async oauthCallback(
        @Query() query: { code?: string; state?: string },
        @Param('provider') provider: OAuthProvider,
        @Res({ passthrough: true }) res: FastifyReply,
        @Req() req: FastifyRequest,
    ) {
        const meta = getDeviceMeta(req);
        const url = await this.facade.handleOAuthCallback(provider, req.user, meta, query?.state);

        res.redirect(url, 302);
    }

    @Post('exchange')
    @ExchangeSwagger()
    @HttpCode(200)
    async exchange(
        @Body() dto: ExchangeDto,
        @Res({ passthrough: true }) res: FastifyReply,
        @Req() req: FastifyRequest,
    ) {
        const meta = getDeviceMeta(req);

        const { expiresAt, refresh, ...result } = await this.facade.exchangeToken(dto, meta);

        this.setRefreshCookie(res, refresh, expiresAt);

        return result;
    }

    @Get('providers')
    @GetOAuthProvidersSwagger()
    async getEnabledProviders() {
        return this.facade.getEnabledProviders();
    }

    @Get('providers/connected')
    @GetConnectedProvidersSwagger()
    @UseGuards(BearerAuthGuard)
    async getConnected(@GetUserId() userId: string) {
        return this.facade.getConnectedProviders(userId);
    }

    @Post(':provider/connect')
    @UseGuards(BearerAuthGuard)
    @ConnectOAuthProviderSwagger()
    async connect(@Param('provider') provider: OAuthProvider, @GetUserId() userId: string) {
        return this.facade.connectProvider(provider, userId);
    }

    @Delete(':provider/disconnect')
    @DisconnectOAuthProviderSwagger()
    @UseGuards(BearerAuthGuard)
    async disconnect(@GetUserId() userId: string, @Param('provider') provider: OAuthProvider) {
        return this.facade.disconnectProvider(provider, userId);
    }

    private setRefreshCookie(res: FastifyReply, refreshToken: string, expires: Date) {
        res.setCookie('refresh', refreshToken, {
            signed: false,
            expires,
        });
    }
}
