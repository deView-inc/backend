import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken } from 'livekit-server-sdk';

export interface GetRoomTokenInput {
    roomId: string;
    userId: string;
    email: string;
}

export interface GetRoomTokenOutput {
    token: string;
    wsUrl: string;
}

@Injectable()
export class GetRoomTokenUseCase {
    constructor(private readonly config: ConfigService) {}

    async execute({ roomId, userId, email }: GetRoomTokenInput): Promise<GetRoomTokenOutput> {
        const at = new AccessToken(
            this.config.getOrThrow('LIVEKIT_API_KEY'),
            this.config.getOrThrow('LIVEKIT_API_SECRET'),
            { identity: userId, name: email },
        );

        at.addGrant({
            room: roomId,
            roomJoin: true,
            canPublish: true,
            canSubscribe: true,
        });

        return {
            token: await at.toJwt(),
            wsUrl: this.config.getOrThrow('LIVEKIT_URL'),
        };
    }
}
