import { RedisModule } from '@nestjs-modules/ioredis';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RedisCacheAdapter } from './adapters';
import { CACHE_SERVICE } from './constants';

@Global()
@Module({
    imports: [
        RedisModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (cfg: ConfigService) => {
                const host = cfg.getOrThrow('REDIS_HOST');
                const port = cfg.get('REDIS_PORT');
                const password = cfg.get('REDIS_PASSWORD');
                const url = `redis://${host}${port ? `:${port}` : ''}`;

                return {
                    type: 'single',
                    url,
                    options: {
                        password,
                        retryStrategy(times) {
                            return Math.min(times * 50, 2000);
                        },
                        commandTimeout: 3000,
                    },
                };
            },
        }),
    ],
    providers: [
        {
            provide: CACHE_SERVICE,
            useClass: RedisCacheAdapter,
        },
    ],
    exports: [CACHE_SERVICE],
})
export class CacheModule {}
