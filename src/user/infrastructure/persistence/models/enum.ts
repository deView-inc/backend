import { USER_GENDERS, USER_GRADES, USER_PRONOUNS, USER_THEMES } from '@core/user/domain/enums';
import { baseSchema } from '@shared/entities';

export const userGradeEnum = baseSchema.enum('user_grade', USER_GRADES);
export const userGenderEnum = baseSchema.enum('user_gender', USER_GENDERS);
export const userPronounsEnum = baseSchema.enum('user_pronouns', USER_PRONOUNS);
export const userThemeEnum = baseSchema.enum('user_theme', USER_THEMES);
