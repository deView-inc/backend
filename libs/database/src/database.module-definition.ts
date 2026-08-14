import { ConfigurableModuleBuilder } from '@nestjs/common';

import type { DatabaseModuleOptions } from './interfaces';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE, ASYNC_OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<DatabaseModuleOptions>()
        .setClassMethodName('register')
        .setExtras(
            {
                global: false,
            },
            (definition, extras) => ({
                ...definition,
                global: extras.global,
            }),
        )
        .build();
