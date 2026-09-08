import { IIdentityRepository } from '@core/auth/domain/repository';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GetConnectedProvidersQuery {
    constructor(
        @Inject('IIdentityRepository')
        private readonly identityRepo: IIdentityRepository,
    ) {}

    async execute(userId: string) {
        const providers = await this.identityRepo.findAllByUserId(userId);

        return providers.map((p) => ({
            connectedAt: p.connectedAt,
            provider: p.provider,
            avatarUrl: p.avatarUrl,
            email: p.email,
        }));
    }
}
