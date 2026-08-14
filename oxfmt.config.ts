import { defineConfig } from 'oxfmt';

export default defineConfig({
    arrowParens: 'always',
    bracketSameLine: false,
    bracketSpacing: true,
    ignore: [
        '**/node_modules/**',
        '**/.pnpm-store/**',

        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        '**/out/**',
        '**/coverage/**',

        '**/.turbo/**',
        '**/.cache/**',

        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '**/__tests__/**',
        '**/__mocks__/**',

        '**/*.min.js',
        '**/*.bundle.js',

        '**/.env*',

        '**/pnpm-lock.yaml',
        '**/package-lock.json',
        '**/yarn.lock',

        '**/*.log',
        '**/.netlify/**',
        '**/.DS_Store',

        '**/.idea/**',
        '**/.vscode/**',
    ],
    jsxSingleQuote: false,
    printWidth: 100,
    quoteProps: 'as-needed',
    semi: true,
    singleAttributePerLine: true,
    singleQuote: true,
    sortImports: true,
    sortPackageJson: true,
    sortTailwindcss: true,
    tabWidth: 4,
    trailingComma: 'all',
    useTabs: false,
});
