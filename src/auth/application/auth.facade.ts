import { OAuthProvider } from '@core/auth/infrastructure/constants';
import { Injectable } from '@nestjs/common';

import type { DeviceMetadata } from '../infrastructure/utils';
import { ExchangeDto, ResendCodeDto, SignInDto, SignUpDto, VerifyDto } from './dtos';
import {
    SignInUseCase,
    SignUpUseCase,
    SignOutUseCase,
    SignUpVerifyUseCase,
    RefreshTokensUseCase,
    ResendCodeUseCase,
    SignInVerifyUseCase,
    GetConnectedProvidersQuery,
    DisconnectProviderUseCase,
    ConnectProviderUseCase,
    GetEnabledProvidersQuery,
    ExchangeUseCase,
    HandleOAuthCallbackUseCase,
} from './use-cases';

@Injectable()
export class AuthFacade {
    constructor(
        private readonly signInUseCase: SignInUseCase,
        private readonly signUpUseCase: SignUpUseCase,
        private readonly signOutUseCase: SignOutUseCase,
        private readonly signUpVerifyUseCase: SignUpVerifyUseCase,
        private readonly signInVerifyUseCase: SignInVerifyUseCase,
        private readonly refreshTokensUseCase: RefreshTokensUseCase,
        private readonly resendCodeUseCase: ResendCodeUseCase,

        private readonly getEnabledProvidersQuery: GetEnabledProvidersQuery,
        private readonly handleOAuthCallbackUC: HandleOAuthCallbackUseCase,
        private readonly connectProviderUseCase: ConnectProviderUseCase,
        private readonly disconnectProviderUseCase: DisconnectProviderUseCase,
        private readonly getConnectedProvidersQuery: GetConnectedProvidersQuery,
        private readonly exchangeTokenUC: ExchangeUseCase,
    ) {}

    public async signInVerify(dto: VerifyDto, device: DeviceMetadata) {
        return this.signInVerifyUseCase.execute(dto, device);
    }

    public async signIn(dto: SignInDto) {
        return this.signInUseCase.execute(dto);
    }

    public async signUp(dto: SignUpDto) {
        return this.signUpUseCase.execute(dto);
    }

    public async resendCode(dto: ResendCodeDto) {
        return this.resendCodeUseCase.execute(dto);
    }

    public async verifySignUp(dto: VerifyDto, device: DeviceMetadata) {
        return this.signUpVerifyUseCase.execute(dto, device);
    }

    public async signOut(token?: string) {
        return this.signOutUseCase.execute(token);
    }

    public async refreshTokens(token: string | undefined, device: DeviceMetadata) {
        return this.refreshTokensUseCase.execute(token, device);
    }

    public async exchangeToken(dto: ExchangeDto, device: DeviceMetadata) {
        return this.exchangeTokenUC.execute(dto, device);
    }

    public async handleOAuthCallback(
        provider: OAuthProvider,
        rawProfile: unknown,
        device: DeviceMetadata,
        state?: string,
    ) {
        return this.handleOAuthCallbackUC.execute(provider, rawProfile, device, state);
    }

    public async connectProvider(provider: OAuthProvider, userId: string) {
        return this.connectProviderUseCase.execute(provider, userId);
    }

    public async disconnectProvider(provider: OAuthProvider, userId: string) {
        return this.disconnectProviderUseCase.execute(provider, userId);
    }

    public async getConnectedProviders(userId: string) {
        return this.getConnectedProvidersQuery.execute(userId);
    }

    public async getEnabledProviders() {
        return this.getEnabledProvidersQuery.execute();
    }
}
