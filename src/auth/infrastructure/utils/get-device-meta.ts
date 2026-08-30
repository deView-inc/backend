import type { FastifyRequest } from 'fastify';
import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';

export interface DeviceMetadata {
    readonly ip: string;
    readonly userAgent: string;
    readonly browser: string;
    readonly os: string;
    readonly deviceType: 'mobile' | 'desktop' | 'tablet';
    readonly country: string;
    readonly city: string;
}

export function getDeviceMeta(req: FastifyRequest): DeviceMetadata {
    const uaString = req.headers['user-agent'] || '';
    const parser = new UAParser(uaString);
    const res = parser.getResult();

    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || '0.0.0.0';

    const geo = geoip.lookup(ip);

    let deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop';
    if (res.device.type === 'mobile') {
        deviceType = 'mobile';
    }
    if (res.device.type === 'tablet') {
        deviceType = 'tablet';
    }

    return {
        ip,
        userAgent: uaString,
        browser: `${res.browser.name || 'Unknown'} ${res.browser.version || ''}`.trim(),
        os: `${res.os.name || 'Unknown'} ${res.os.version || ''}`.trim(),
        deviceType,
        country: geo?.country || 'Unknown',
        city: geo?.city || 'Unknown',
    };
}
