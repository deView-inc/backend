import { ROOM_DIFFICULTIES, ROOM_LANGUAGES, ROOM_ROLES } from '@core/rooms/domain/enums';
import { baseSchema } from '@shared/entities';

// Вынесены в отдельный файл, чтобы tasks и rooms могли делить enum'ы без циклического импорта
export const roomRoleEnum = baseSchema.enum('room_role', ROOM_ROLES);
export const roomDifficultyEnum = baseSchema.enum('room_difficulty', ROOM_DIFFICULTIES);
export const roomLanguageEnum = baseSchema.enum('room_language', ROOM_LANGUAGES);
