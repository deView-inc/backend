export const ROOM_ROLES = ['interviewer', 'hr', 'candidate', 'participant', 'viewer'] as const;
export type RoomRole = (typeof ROOM_ROLES)[number];

export const ROOM_PERMISSIONS = {
    interviewer: ['manageRoom', 'assignRoles', 'editCode', 'publishMedia', 'chat', 'record'],
    hr: ['publishMedia', 'chat', 'viewCode'],
    candidate: ['editCode', 'publishMedia', 'chat'],
    participant: ['publishMedia', 'chat', 'viewCode'],
    viewer: ['viewCode'],
} as const satisfies Record<RoomRole, readonly string[]>;

export type RoomPermission = (typeof ROOM_PERMISSIONS)[RoomRole][number];

export const can = (role: RoomRole, perm: RoomPermission): boolean =>
    (ROOM_PERMISSIONS[role] as readonly string[]).includes(perm);

// Id совпадают с фронтом: widgets/room-create/lib/room-create.ts
export const ROOM_DIFFICULTIES = ['junior', 'middle', 'senior', 'system-design'] as const;
export type RoomDifficulty = (typeof ROOM_DIFFICULTIES)[number];

export const ROOM_LANGUAGES = [
    'js',
    'ts',
    'python',
    'go',
    'java',
    'cpp',
    'c',
    'csharp',
    'kotlin',
    'swift',
    'rust',
    'php',
    'ruby',
    'scala',
    'dart',
    'sql',
    'html',
    'css',
    'r',
    'matlab',
    'perl',
    'haskell',
    'elixir',
    'clojure',
    'lua',
    'objc',
    'groovy',
    'bash',
    'powershell',
    'assembly',
    'fortran',
    'vbnet',
    'fsharp',
    'ocaml',
    'zig',
    'nim',
    'solidity',
    'julia',
    'erlang',
    'cobol',
] as const;
export type RoomLanguage = (typeof ROOM_LANGUAGES)[number];
