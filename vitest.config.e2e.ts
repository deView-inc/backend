import { defineConfig, mergeConfig } from 'vitest/config';

import baseConfig from './vitest.config';

export default mergeConfig(
    baseConfig,
    defineConfig({
        test: {
            exclude: [],
            include: ['test/**/*.e2e-spec.ts'],
            isolate: true,
            pool: 'forks',
        },
    }),
);
