import { SessionSelect } from '@core/auth/domain/repository';

export type SessionEmail = Pick<
    SessionSelect,
    'city' | 'country' | 'deviceType' | 'browser' | 'createdAt' | 'os' | 'ip'
>;
