import { describe, expect, it } from 'vitest';

import { can, ROOM_PERMISSIONS, ROOM_ROLES } from './room.enum';

describe('права ролей в комнате', () => {
    it('у каждой роли есть описание прав', () => {
        for (const role of ROOM_ROLES) {
            expect(ROOM_PERMISSIONS[role]).toBeDefined();
        }
    });

    it('интервьюер управляет комнатой, выдаёт роли и пишет запись', () => {
        expect(can('interviewer', 'manageRoom')).toBe(true);
        expect(can('interviewer', 'assignRoles')).toBe(true);
        expect(can('interviewer', 'record')).toBe(true);
    });

    it('зритель только смотрит код: без камеры, чата и редактора', () => {
        expect(can('viewer', 'viewCode')).toBe(true);
        expect(can('viewer', 'publishMedia')).toBe(false);
        expect(can('viewer', 'chat')).toBe(false);
        expect(can('viewer', 'editCode')).toBe(false);
    });

    it('роль выдавать и записывать может только интервьюер', () => {
        for (const role of ROOM_ROLES.filter((r) => r !== 'interviewer')) {
            expect(can(role, 'assignRoles')).toBe(false);
            expect(can(role, 'record')).toBe(false);
            expect(can(role, 'manageRoom')).toBe(false);
        }
    });

    it('кандидат пишет код и публикует медиа', () => {
        expect(can('candidate', 'editCode')).toBe(true);
        expect(can('candidate', 'publishMedia')).toBe(true);
    });

    it('участник и hr общаются, но код не правят', () => {
        for (const role of ['participant', 'hr'] as const) {
            expect(can(role, 'chat')).toBe(true);
            expect(can(role, 'publishMedia')).toBe(true);
            expect(can(role, 'editCode')).toBe(false);
        }
    });
});
