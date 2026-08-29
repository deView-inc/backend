// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { SignUpDto } from '@core/auth/application/dtos';

export interface SignUpCacheData {
    user: SignUpDto;
    otp: {
        token: string;
        secret: string;
    };
}

export interface SignInCacheData {
    user: {
        id: string;
        email: string;
    };
    otp: {
        token: string;
        secret: string;
    };
}

export interface ResetPasswordCacheData {
    email: string;
    otp: {
        secret: string;
        token: string;
    };
    isVerified: boolean;
}
