import { HttpStatus } from '@nestjs/common';
import { BaseException } from '@shared/error';

export const RoomErrors = {
    notFound: () =>
        new BaseException(
            { code: 'ROOM.NOT_FOUND', message: 'Комната не найдена' },
            HttpStatus.NOT_FOUND,
        ),
    forbidden: () =>
        new BaseException(
            { code: 'ROOM.FORBIDDEN', message: 'Недостаточно прав' },
            HttpStatus.FORBIDDEN,
        ),
    closed: () =>
        new BaseException({ code: 'ROOM.CLOSED', message: 'Комната завершена' }, HttpStatus.GONE),
    recordingDisabled: () =>
        new BaseException(
            { code: 'ROOM.RECORDING_DISABLED', message: 'Запись отключена в настройках комнаты' },
            HttpStatus.BAD_REQUEST,
        ),
};
