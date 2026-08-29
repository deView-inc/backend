import { SessionRepository } from './session.repository';

export const REPOSITORIES = [{ provide: 'ISessionRepository', useClass: SessionRepository }];
