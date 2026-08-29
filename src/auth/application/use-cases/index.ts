import { RefreshTokensUseCase } from './auth/refresh-tokens.use-case';
import { ResendCodeUseCase } from './auth/resend-code.use-case';
import { SignInVerifyUseCase } from './auth/sign-in-verify.use-case';
import { SignInUseCase } from './auth/sign-in.use-case';
import { SignOutUseCase } from './auth/sign-out.use-case';
import { SignUpVerifyUseCase } from './auth/sign-up-verify.use-case';
import { SignUpUseCase } from './auth/sign-up.use-case';

export const AuthUseCases = [
    RefreshTokensUseCase,
    SignUpVerifyUseCase,
    SignInUseCase,
    SignInVerifyUseCase,
    SignOutUseCase,
    SignUpUseCase,
    ResendCodeUseCase,
];

export * from './auth/refresh-tokens.use-case';
export * from './auth/sign-up-verify.use-case';
export * from './auth/sign-in-verify.use-case';
export * from './auth/sign-in.use-case';
export * from './auth/sign-out.use-case';
export * from './auth/sign-up.use-case';
export * from './auth/resend-code.use-case';
