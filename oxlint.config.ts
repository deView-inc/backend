import { defineConfig } from 'oxlint';

export default defineConfig({
    categories: {
        correctness: 'off',
        perf: 'warn',
        style: 'warn',
    },

    env: {
        builtin: true,
    },

    ignorePatterns: ['node_modules', 'dist', '**/*.js', '**/*.d.ts', 'infra', 'migrations'],

    jsPlugins: ['eslint-plugin-functional', 'eslint-plugin-sonarjs'],

    options: {
        typeAware: true,
    },

    overrides: [
        /*
         * TypeScript-specific rules
         */
        {
            files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],

            rules: {
                'constructor-super': 'off',
                'getter-return': 'off',
                'no-class-assign': 'off',
                'no-const-assign': 'off',
                'no-dupe-class-members': 'off',
                'no-dupe-keys': 'off',
                'no-func-assign': 'off',
                'no-import-assign': 'off',
                'no-new-native-nonconstructor': 'off',
                'no-obj-calls': 'off',
                'no-redeclare': 'off',
                'no-setter-return': 'off',
                'no-this-before-super': 'off',
                'no-unreachable': 'off',
                'no-unsafe-negation': 'off',
                'no-with': 'off',

                'prefer-rest-params': 'error',
                'prefer-spread': 'error',
            },
        },

        /*
         * Infrastructure / migrations / config
         */
        {
            files: ['infra/**/*.ts', '**/migrations/**/*.ts', '**/*.config.ts', 'libs/**/*.ts'],

            jsPlugins: ['eslint-plugin-functional'],

            rules: {
                'functional/immutable-data': 'off',
                'functional/no-conditional-statements': 'off',
            },
        },

        /*
         * NestJS architectural files
         */
        {
            files: [
                '**/*.{facade,repository,service,controller,query,use-case,adapter}.ts',
                '**/controller.ts',
                '**/adapter.ts',
            ],

            jsPlugins: ['eslint-plugin-sonarjs', 'eslint-plugin-functional'],

            rules: {
                'functional/immutable-data': 'off',
                'no-unused-vars': 'off',
                'no-useless-constructor': 'off',
                'require-await': 'off',
                'sonarjs/cognitive-complexity': 'off',
                'unicorn/no-useless-undefined': 'off',
                'unicorn/prefer-export-from': 'off',
            },
        },

        /*
         * Import type { AppService } breaks NestJS runtime metadata.
         */
        {
            files: [
                '**/*.controller.ts',
                '**/*.service.ts',
                '**/*.module.ts',
                '**/*.guard.ts',
                '**/*.interceptor.ts',
                '**/*.pipe.ts',
                '**/*.filter.ts',
                '**/*.middleware.ts',
                '**/*.resolver.ts',
            ],

            rules: {
                'typescript/consistent-type-imports': 'off',
            },
        },
    ],

    plugins: ['typescript', 'unicorn', 'jsdoc'],

    rules: {
        /*
         * =========================
         * JavaScript
         * =========================
         */

        'constructor-super': 'error',
        'for-direction': 'error',
        'getter-return': 'error',
        'no-async-promise-executor': 'error',
        'no-case-declarations': 'error',
        'no-class-assign': 'error',
        'no-compare-neg-zero': 'error',
        'no-cond-assign': 'error',
        'no-const-assign': 'error',
        'no-constant-binary-expression': 'error',
        'no-constant-condition': 'error',
        'no-control-regex': 'error',
        'no-debugger': 'error',
        'no-delete-var': 'error',
        'no-dupe-class-members': 'error',
        'no-dupe-else-if': 'error',
        'no-dupe-keys': 'error',
        'no-duplicate-case': 'error',
        'no-empty': 'error',
        'no-empty-character-class': 'error',
        'no-empty-pattern': 'error',
        'no-empty-static-block': 'error',
        'no-ex-assign': 'error',
        'no-extra-boolean-cast': 'error',
        'no-fallthrough': 'error',
        'no-func-assign': 'error',
        'no-global-assign': 'error',
        'no-import-assign': 'error',
        'no-invalid-regexp': 'error',
        'no-irregular-whitespace': 'error',
        'no-loss-of-precision': 'error',
        'no-misleading-character-class': 'error',
        'no-new-native-nonconstructor': 'error',
        'no-nonoctal-decimal-escape': 'error',
        'no-obj-calls': 'error',
        'no-prototype-builtins': 'error',
        'no-redeclare': 'error',
        'no-regex-spaces': 'error',
        'no-self-assign': 'error',
        'no-setter-return': 'error',
        'no-shadow-restricted-names': 'error',
        'no-sparse-arrays': 'error',
        'no-this-before-super': 'error',
        'no-unassigned-vars': 'error',
        'no-unexpected-multiline': 'error',
        'no-unreachable': 'error',
        'no-unsafe-finally': 'error',
        'no-unsafe-negation': 'error',
        'no-unsafe-optional-chaining': 'error',
        'no-unused-labels': 'error',
        'no-unused-private-class-members': 'error',
        'no-useless-backreference': 'error',
        'no-useless-catch': 'error',
        'no-useless-escape': 'error',
        'no-with': 'error',
        'preserve-caught-error': 'error',
        'require-yield': 'error',
        'use-isnan': 'error',
        'valid-typeof': 'error',

        'no-array-constructor': 'error',
        'no-unused-expressions': 'error',
        'no-duplicate-imports': 'error',

        'no-console': [
            'warn',
            {
                allow: ['warn', 'error'],
            },
        ],

        'no-shadow': 'error',

        'no-param-reassign': 'warn',

        'no-promise-executor-return': 'error',

        'no-await-in-loop': 'warn',

        'no-useless-return': 'warn',

        eqeqeq: ['error', 'always'],
        curly: ['error', 'all'],
        'no-var': 'error',
        'prefer-const': 'error',
        'prefer-template': 'error',
        'object-shorthand': ['error', 'always'],
        'arrow-body-style': ['error', 'as-needed'],
        'prefer-arrow-callback': 'warn',
        'prefer-destructuring': 'warn',

        /*
         * =========================
         * TypeScript
         * =========================
         */

        'typescript/ban-ts-comment': 'error',

        'typescript/no-duplicate-enum-values': 'error',
        'typescript/no-empty-object-type': 'error',
        'typescript/no-explicit-any': 'warn',
        'typescript/no-extra-non-null-assertion': 'error',
        'typescript/no-misused-new': 'error',
        'typescript/no-namespace': 'error',
        'typescript/no-non-null-assertion': 'warn',
        'typescript/no-non-null-asserted-optional-chain': 'error',
        'typescript/no-require-imports': 'error',
        'typescript/no-this-alias': 'error',
        'typescript/no-unnecessary-type-constraint': 'error',
        'typescript/no-unsafe-declaration-merging': 'error',
        'typescript/no-unsafe-function-type': 'error',
        'typescript/no-wrapper-object-types': 'error',

        'typescript/prefer-as-const': 'error',
        'typescript/prefer-for-of': 'warn',
        'typescript/prefer-function-type': 'warn',
        'typescript/prefer-includes': 'warn',
        'typescript/prefer-namespace-keyword': 'error',
        'typescript/prefer-optional-chain': 'warn',
        'typescript/prefer-readonly': 'warn',

        'typescript/triple-slash-reference': 'error',

        'typescript/consistent-type-imports': [
            'error',
            {
                disallowTypeAnnotations: false,
                fixStyle: 'separate-type-imports',
                prefer: 'type-imports',
            },
        ],

        'typescript/no-floating-promises': 'error',
        'typescript/await-thenable': 'error',

        /*
         * =========================
         * Unicorn
         * =========================
         */

        'unicorn/filename-case': [
            'error',
            {
                case: 'kebabCase',
                ignore: ['index.ts', String.raw`\.d\.ts$`],
            },
        ],

        'unicorn/prefer-node-protocol': 'error',
        'unicorn/no-array-method-this-argument': 'warn',
        'unicorn/prefer-structured-clone': 'error',
        'unicorn/no-useless-undefined': 'error',
        'unicorn/prefer-export-from': 'error',
        'unicorn/prefer-spread': 'warn',
        'unicorn/no-array-reduce': 'warn',

        /*
         * =========================
         * Functional
         * =========================
         */

        'functional/prefer-readonly-type': 'off',
        'functional/no-conditional-statements': 'off',
        'functional/no-return-void': 'off',
        'functional/immutable-data': 'warn',
        'functional/no-let': 'off',
        'functional/no-expression-statements': 'off',

        /*
         * =========================
         * SonarJS
         * =========================
         */

        'sonarjs/cognitive-complexity': ['error', 15],

        'sonarjs/no-duplicate-string': [
            'warn',
            {
                threshold: 5,
            },
        ],

        'sonarjs/no-identical-functions': 'error',
        'sonarjs/no-collapsible-if': 'error',
        'sonarjs/no-unused-collection': 'error',

        /*
         * =========================
         * JSDoc
         * =========================
         */

        'jsdoc/require-param-type': 'error',
        'jsdoc/require-returns-type': 'error',

        /*
         * =========================
         * Restrictions
         * =========================
         */

        'no-restricted-properties': [
            'error',
            {
                message: 'Используйте slice/spread вместо pop',
                object: 'Array',
                property: 'pop',
            },
            {
                message: 'Используйте filter/slice вместо splice',
                object: 'Array',
                property: 'splice',
            },
            {
                message: 'Используйте spread оператор: {...obj, newProp} вместо Object.assign',
                object: 'Object',
                property: 'assign',
            },
        ],
    },
});
