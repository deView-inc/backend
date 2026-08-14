import { Module, type Type } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule, type ThrottlerModuleOptions } from '@nestjs/throttler';

export function setupThrottler(module: Type<unknown>, options: ThrottlerModuleOptions) {
    @Module({
        imports: [module, ThrottlerModule.forRoot(options)],
        providers: [
            {
                provide: APP_GUARD,
                useClass: ThrottlerGuard,
            },
        ],
    })
    class RootModule {}

    return RootModule;
}
