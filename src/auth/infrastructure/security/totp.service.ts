import { EMAIL_CODE_TTL_SECONDS } from '@core/auth/infrastructure/constants';
import { Injectable } from '@nestjs/common';
import { generate, generateSecret } from 'otplib';
import { verify as verifyOTP } from 'otplib/functional';

@Injectable()
export class OtpService {
    constructor() {}

    async generateCode() {
        const secret = generateSecret();
        const token = await generate({
            secret,
            algorithm: 'sha256',
            digits: 6,
            period: EMAIL_CODE_TTL_SECONDS,
            strategy: 'totp',
        });

        return { token, secret };
    }

    async verifyCode(code: string, cachedCode: string, secret: string) {
        if (cachedCode !== code) {
            return false;
        }

        const res = await verifyOTP({
            token: code,
            secret,
            algorithm: 'sha256',
            digits: 6,
            period: 900,
            strategy: 'totp',
            afterTimeStep: 1,
        });

        return res.valid;
    }
}
