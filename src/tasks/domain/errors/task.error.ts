import { HttpStatus } from '@nestjs/common';
import { BaseException } from '@shared/error';

export const TaskErrors = {
    notFound: () =>
        new BaseException(
            { code: 'TASK.NOT_FOUND', message: 'Задача не найдена' },
            HttpStatus.NOT_FOUND,
        ),
    forbidden: () =>
        new BaseException(
            { code: 'TASK.FORBIDDEN', message: 'Менять можно только свои задачи' },
            HttpStatus.FORBIDDEN,
        ),
    cannotReportOwn: () =>
        new BaseException(
            { code: 'TASK.CANNOT_REPORT_OWN', message: 'Нельзя жаловаться на свою задачу' },
            HttpStatus.BAD_REQUEST,
        ),
    cannotReportOfficial: () =>
        new BaseException(
            {
                code: 'TASK.CANNOT_REPORT_OFFICIAL',
                message: 'Жалобы принимаются только на задачи сообщества',
            },
            HttpStatus.BAD_REQUEST,
        ),
    alreadyReported: () =>
        new BaseException(
            { code: 'TASK.ALREADY_REPORTED', message: 'Вы уже пожаловались на эту задачу' },
            HttpStatus.CONFLICT,
        ),
};
