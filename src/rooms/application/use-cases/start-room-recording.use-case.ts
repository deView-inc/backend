import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EgressClient, EncodedFileOutput, EncodedFileType, S3Upload } from 'livekit-server-sdk';

export interface StartRecordingInput {
    roomId: string;
}

export interface StartRecordingOutput {
    egressId: string;
}

@Injectable()
export class StartRoomRecordingUseCase {
    constructor(private readonly config: ConfigService) {}

    async execute({ roomId }: StartRecordingInput): Promise<StartRecordingOutput> {
        const egressClient = new EgressClient(
            this.config.getOrThrow<string>('LIVEKIT_URL'),
            this.config.getOrThrow<string>('LIVEKIT_API_KEY'),
            this.config.getOrThrow<string>('LIVEKIT_API_SECRET'),
        );

        const output = new EncodedFileOutput({
            fileType: EncodedFileType.MP4,
            filepath: `${roomId}_${Date.now()}.mp4`,
            output: {
                case: 's3',
                value: new S3Upload({
                    bucket: this.config.getOrThrow<string>('S3_RECORDINGS_BUCKET'),
                    accessKey: this.config.getOrThrow<string>('S3_ACCESS_KEY'),
                    secret: this.config.getOrThrow<string>('S3_SECRET_KEY'),
                    region: this.config.getOrThrow<string>('S3_REGION'),
                    endpoint: this.config.getOrThrow<string>('S3_EGRESS_ENDPOINT'),
                    forcePathStyle: true,
                }),
            },
        });

        const egress = await egressClient.startRoomCompositeEgress(roomId, output, {
            layout: 'grid',
        });

        return { egressId: egress.egressId };
    }
}
