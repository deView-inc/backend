export const NOTIFICATION_EVENTS = {
    email: { interview_reminder: true },
    push: { interview_reminder: true },
} as const;

export type NotificationChannel = keyof typeof NOTIFICATION_EVENTS;

export type NotificationSettings = {
    readonly [C in NotificationChannel]: {
        readonly [E in keyof (typeof NOTIFICATION_EVENTS)[C]]: boolean;
    };
};

export const createDefaultNotificationSettings = (): NotificationSettings =>
    structuredClone(NOTIFICATION_EVENTS);
