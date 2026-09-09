import { requireAnyKey } from '@shared/utils/require-any-key.util';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod/v4';

export const SecuritySchema = z
    .object({
        is2faEnabled: z.boolean().describe('Статус двухфакторной аутентификации'),
        recoveryEmail: z
            .email()
            .max(255)
            .toLowerCase()
            .describe('Дополнительная почта для восстановления доступа'),
    })
    .describe('Данные безопасности аккаунта');
export class SecurityDto extends createZodDto(SecuritySchema) {}

export const UpdateSecuritySchema = requireAnyKey(
    SecuritySchema.partial().describe(
        'Схема для частичного обновления настроек безопасности пользователя',
    ),
);
export class UpdateSecurityDto extends createZodDto(UpdateSecuritySchema) {}
