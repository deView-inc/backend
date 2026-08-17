export const USER_GRADES = ['trainee', 'junior', 'junior+', 'middle', 'middle+', 'senior'] as const;
export type UserGrade = (typeof USER_GRADES)[number];

export const USER_GENDERS = ['male', 'female', 'non_binary', 'other', 'prefer_not_to_say'] as const;
export type UserGender = (typeof USER_GENDERS)[number];

export const USER_PRONOUNS = ['he_him', 'she_her', 'they_them', 'other'] as const;
export type UserPronouns = (typeof USER_PRONOUNS)[number];
