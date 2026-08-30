export const USER_THEMES = ['light', 'dark', 'system'] as const;
export type UserTheme = (typeof USER_THEMES)[number];
