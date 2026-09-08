import { RefreshTokensUseCase } from './auth/refresh-tokens.use-case';
import { ResendCodeUseCase } from './auth/resend-code.use-case';
import { SignInVerifyUseCase } from './auth/sign-in-verify.use-case';
import { SignInUseCase } from './auth/sign-in.use-case';
import { SignOutUseCase } from './auth/sign-out.use-case';
import { SignUpVerifyUseCase } from './auth/sign-up-verify.use-case';
import { SignUpUseCase } from './auth/sign-up.use-case';
import { ConnectOAuthProviderUseCase } from './oauth/connect-oauth-provider.use-case';
import { ConnectProviderUseCase } from './oauth/connect-provider.use-case';
import { DisconnectProviderUseCase } from './oauth/disconnect-provider.use-case';
import { ExchangeUseCase } from './oauth/exchange.use-case';
import { GetConnectedProvidersQuery } from './oauth/get-connected-providers.query';
import { GetEnabledProvidersQuery } from './oauth/get-enabled-providers.query';
import { HandleOAuthCallbackUseCase } from './oauth/handle-oauth-callback.use-case';
import { ProcessOAuthSignUseCase } from './oauth/process-oauth-sign.use-case';

export const AuthUseCases = [
    RefreshTokensUseCase,
    SignUpVerifyUseCase,
    SignInUseCase,
    SignInVerifyUseCase,
    SignOutUseCase,
    SignUpUseCase,
    ResendCodeUseCase,
    HandleOAuthCallbackUseCase,
    ConnectOAuthProviderUseCase,
    ConnectProviderUseCase,
    DisconnectProviderUseCase,
    ExchangeUseCase,
    GetConnectedProvidersQuery,
    GetEnabledProvidersQuery,
    ProcessOAuthSignUseCase,
];

export * from './auth/refresh-tokens.use-case';
export * from './auth/sign-up-verify.use-case';
export * from './auth/sign-in-verify.use-case';
export * from './auth/sign-in.use-case';
export * from './auth/sign-out.use-case';
export * from './auth/sign-up.use-case';
export * from './auth/resend-code.use-case';

export * from './oauth/get-enabled-providers.query';
export * from './oauth/exchange.use-case';
export * from './oauth/process-oauth-sign.use-case';
export * from './oauth/connect-oauth-provider.use-case';
export * from './oauth/get-connected-providers.query';
export * from './oauth/disconnect-provider.use-case';
export * from './oauth/handle-oauth-callback.use-case';
export * from './oauth/connect-provider.use-case';
