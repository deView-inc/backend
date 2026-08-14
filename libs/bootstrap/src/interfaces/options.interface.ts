import type { Config } from '@libs/config';
import type { Type } from '@nestjs/common';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { ThrottlerModuleOptions } from '@nestjs/throttler';

export interface SwaggerMetadata {
    readonly title?: string;
    readonly description?: string;
    readonly version?: string;
    readonly path?: string;
}

export interface SwaggerInfrastructure {
    readonly server?: {
        readonly port?: string | number;
        readonly domain?: string;
        readonly stage?: string;
    };
    readonly services?: readonly { readonly name: string; readonly port: number }[];
}

export interface SwaggerOptions extends SwaggerMetadata, SwaggerInfrastructure {}

export interface BootstrapOptions {
    readonly apiPrefix?: string;
    readonly version?: string;
    readonly appModule: Type<unknown>;
    readonly defaultPort?: number;
    readonly portEnvKey?: keyof Config;
    readonly serviceName: string;
    readonly setupApp?: (app: NestFastifyApplication) => Promise<void> | void;
    readonly swaggerOptions?: SwaggerMetadata;
    readonly throttlerOptions?: ThrottlerModuleOptions;
    readonly useCookieParser?: boolean;
    readonly useCors?: boolean;
}
