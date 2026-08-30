import { dirname } from 'node:path';

import type { ConfigService } from '@nestjs/config';

export class ImageHelper {
    private static cdnBase(cfg: ConfigService) {
        const bucket = cfg.get<string>('S3_BUCKET_NAME');
        return cfg.get<string>('DOMAIN')
            ? `https://cdn.${cfg.get('DOMAIN')}/${bucket}`
            : `${cfg.get('S3_ENDPOINT')}/${bucket}`;
    }

    static responsive(cfg: ConfigService, path?: string | null) {
        if (!path) {
            return null;
        }

        const folder = dirname(path);
        const base = `${this.cdnBase(cfg)}/${folder}`;

        return {
            small: `${base}/sm.webp`,
            medium: `${base}/md.webp`,
            large: `${base}/lg.webp`,
            original: `${this.cdnBase(cfg)}/${path}`,
        };
    }
}
