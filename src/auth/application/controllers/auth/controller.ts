import { getDeviceMeta } from '@core/auth/infrastructure/utils';
import { Body, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBaseController } from '@shared/decorators';
import { BearerAuthGuard, CookieAuthGuard } from '@shared/guards';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { AuthFacade } from '../../auth.facade';
import { ResendCodeDto, SignInDto, SignUpDto, VerifyDto } from '../../dtos';
import {
    PostLoginSwagger,
    PostLoginVerifySwagger,
    PostLogoutSwagger,
    PostRefreshSwagger,
    PostRegisterSwagger,
    PostSignUpConfirmSwagger,
    ResendCodeSwagger,
} from './swagger';

@ApiBaseController('auth', 'Auth')
export class AuthController {
    constructor(private readonly facade: AuthFacade) {}

    @Post('sign-up')
    @PostRegisterSwagger()
    @HttpCode(202)
    async signUp(@Body() dto: SignUpDto) {
        return this.facade.signUp(dto);
    }

    @Post('resend')
    @ResendCodeSwagger()
    @HttpCode(200)
    async resendCode(@Body() dto: ResendCodeDto) {
        return this.facade.resendCode(dto);
    }

    @Post('sign-up/confirm')
    @PostSignUpConfirmSwagger()
    @HttpCode(201)
    async verifySignUp(
        @Res({ passthrough: true }) res: FastifyReply,
        @Req() req: FastifyRequest,
        @Body() dto: VerifyDto,
    ) {
        const meta = getDeviceMeta(req);
        const { tokens, expiresAt, ...response } = await this.facade.verifySignUp(dto, meta);

        this.setRefreshCookie(res, tokens.refresh, expiresAt);

        return { ...response, token: tokens.access };
    }

    @Post('sign-in')
    @PostLoginSwagger()
    async signIn(@Body() dto: SignInDto) {
        return this.facade.signIn(dto);
    }

    @Post('sign-in/confirm')
    @PostLoginVerifySwagger()
    async verifySignIn(
        @Res({ passthrough: true }) res: FastifyReply,
        @Req() req: FastifyRequest,
        @Body() dto: VerifyDto,
    ) {
        const meta = getDeviceMeta(req);
        const { tokens, expiresAt, ...response } = await this.facade.signInVerify(dto, meta);

        this.setRefreshCookie(res, tokens.refresh, expiresAt);

        return { ...response, token: tokens.access };
    }

    @Post('sign-out')
    @HttpCode(HttpStatus.OK)
    @UseGuards(BearerAuthGuard)
    @PostLogoutSwagger()
    async logout(@Res({ passthrough: true }) res: FastifyReply, @Req() req: FastifyRequest) {
        const session = req.cookies?.['refresh'];
        const response = await this.facade.signOut(session);
        res.clearCookie('refresh');
        return response;
    }

    @Post('refresh')
    @UseGuards(CookieAuthGuard)
    @PostRefreshSwagger()
    @HttpCode(200)
    async refresh(@Res({ passthrough: true }) res: FastifyReply, @Req() req: FastifyRequest) {
        const meta = getDeviceMeta(req);
        const session = req.cookies?.['refresh'];
        const { tokens, expiresAt, ...response } = await this.facade.refreshTokens(session, meta);

        this.setRefreshCookie(res, tokens.refresh, expiresAt);

        return { token: tokens.access, ...response };
    }

    private setRefreshCookie(res: FastifyReply, token: string, expires: Date) {
        res.setCookie('refresh', token, {
            signed: false,
            expires,
        });
    }
}
