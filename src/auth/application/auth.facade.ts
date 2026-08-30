import { Injectable } from '@nestjs/common';

import type { DeviceMetadata } from '../infrastructure/utils';
import { ResendCodeDto, SignInDto, SignUpDto, VerifyDto } from './dtos';
import {
    SignInUseCase,
    SignUpUseCase,
    SignOutUseCase,
    SignUpVerifyUseCase,
    RefreshTokensUseCase,
    ResendCodeUseCase,
    SignInVerifyUseCase,
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
}
