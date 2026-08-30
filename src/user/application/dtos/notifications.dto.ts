import { createZodDto } from 'nestjs-zod';
import { z } from 'zod/v4';

export const NotificationsSchema = z
    .object({
        email: z
            .object({
                interview_reminder: z
                    .boolean()
                    .describe('Уведомление на почту о скором начале встречи'),
            })
            .strict(),
        push: z
            .object({
                interview_reminder: z.boolean().describe('Уведомление о скором начале встречи'),
            })
            .strict(),
    })
    .strict()
    .describe('Настройки уведомлений пользователя');

export class NotificationsDto extends createZodDto(NotificationsSchema) {}

export const UpdateNotificationSchema = NotificationsSchema.describe(
    'Схема обновления настроек уведомлений пользователя. Требует передачи всех полей!',
);
export class UpdateNotificationsDto extends createZodDto(UpdateNotificationSchema) {}
