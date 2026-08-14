import type { IncomingMessage } from 'node:http';

import fastifyCompress from '@fastify/compress';
import fastifyCookie from '@fastify/cookie';
import fastifyCsrf from '@fastify/csrf-protection';
import fastifyMultipart from '@fastify/multipart';
import { Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { createId } from '@paralleldrive/cuid2';

import { DEFAULT_THROTTLER_OPTIONS } from './configs/throttler';
import type { BootstrapOptions } from './interfaces/options.interface';
import { setupCors, setupLogger, setupSwagger, setupThrottler } from './setups';

export async function bootstrapApp(options: BootstrapOptions) {
    const startTime = performance.now(),
        adapter = new FastifyAdapter({
            genReqId: (req: IncomingMessage) =>
                (req.headers['x-request-id'] as string) || createId(),
            requestIdHeader: 'x-request-id',
            requestIdLogLabel: 'request',
        }),
        {
            appModule,
            apiPrefix,
            version = 'v1',
            serviceName = 'App',
            portEnvKey = 'PORT',
            defaultPort = 3000,
            setupApp,
            useCookieParser = true,
            useCors = true,
            throttlerOptions = DEFAULT_THROTTLER_OPTIONS,
            swaggerOptions,
        } = options;

    let rootModule = appModule;

    if (throttlerOptions) {
        rootModule = setupThrottler(rootModule, throttlerOptions);
    }

    const app = await NestFactory.create<NestFastifyApplication>(rootModule, adapter, {
            bufferLogs: false,
            rawBody: true,
        }),
        logger = new Logger(serviceName?.[0]?.toUpperCase() + serviceName.slice(1)),
        configService = app.get(ConfigService),
        port = configService.getOrThrow<number>(portEnvKey, defaultPort),
        origins = configService.getOrThrow('CORS_ALLOWED_ORIGINS');

    app.enableShutdownHooks();

    app.getHttpAdapter()
        .getInstance()
        /**
         * НАЗНАЧЕНИЕ: Полифил совместимости Fastify с экосистемой Passport.js (Express-way).
         * * ПОЧЕМУ ТУТ ТИП 'any':
         * Объекты 'request' и 'reply' принадлежат типам 'FastifyRequest' и 'FastifyReply'.
         * Библиотека 'passport' жестко ожидает архитектуру Express (в частности, наличие методов
         * res.setHeader(), res.end() и прямой ссылки req.res).
         * * Расширение интерфейсов Fastify через декларацию модулей (Module Augmentation) в данном
         * контексте избыточно, так как мы мутируем объекты исключительно локально внутри инфраструктурного
         * хука для Node.js HTTP-слоя (this.raw). Приведение к 'any' здесь является легитимным решением
         * для динамического monkey-patching-а.
         */
        .addHook('onRequest', (request: any, reply: any, done) => {
            reply.setHeader = function setHeader(key: string, value: string) {
                return this.raw.setHeader(key, value);
            };

            reply.end = function end() {
                this.raw.end();
            };

            request.res = reply;
            done();
        })
        // eslint-disable-next-line require-await
        .addHook('onSend', async (request, reply, payload) => {
            reply.header('x-request-id', request.id);
            return payload;
        });

    setupLogger(app, options.serviceName);

    await app.register(fastifyCompress, {
        global: true,
        threshold: 1024,
    });

    await app.register(fastifyMultipart, {
        limits: {
            fieldNameSize: 100,
            fileSize: 5 * 1024 * 1024,
            files: 5,
        },
    });

    const isProduction = configService.get('NODE_ENV') === 'production',
        domain = configService.get('DOMAIN'),
        stage = configService.get('STAGE_DOMAIN');

    if (apiPrefix) {
        app.setGlobalPrefix(apiPrefix);
    }
    if (version) {
        const hasV = version.startsWith('v');

        app.enableVersioning({
            defaultVersion: hasV ? version.slice(1) : version,
            prefix: hasV ? 'v' : '',
            type: VersioningType.URI,
        });
    }
    if (useCors) {
        setupCors(app, origins);
    }
    if (swaggerOptions) {
        const { path = 'docs', ...metadata } = swaggerOptions,
            fullOptions = {
                ...metadata,
                path,
                server: {
                    domain,
                    port,
                    stage,
                },
            };

        await setupSwagger(app, fullOptions);
    }
    if (useCookieParser) {
        const secret = configService.getOrThrow('COOKIE_SECRET'),
            domainCookie = domain ? `.${domain}` : undefined;
        await app.register(fastifyCookie, {
            parseOptions: {
                domain: domainCookie,
                httpOnly: true,
                path: '/',
                sameSite: 'lax',
                secure: isProduction,
                signed: true,
            },
            secret,
        });
        await app.register(fastifyCsrf, {
            cookieOpts: {
                domain: domainCookie,
                httpOnly: true,
                path: '/',
                sameSite: 'lax',
                secure: isProduction,
            },
            sessionPlugin: '@fastify/cookie',
        });
    }
    if (setupApp) {
        await setupApp(app);
    }

    await app.listen(port, '0.0.0.0', (_err, address) => {
        const prefix = [apiPrefix, version].filter(Boolean).join('/'),
            baseUrl = `${address}${prefix ? `/${prefix}` : ''}`,
            swaggerBase = `${address}${apiPrefix ? `/${apiPrefix}` : ''}`,
            swaggerPath = swaggerOptions?.path ?? 'docs';

        if (_err) {
            logger.error(_err);
            process.exit(1);
        }

        const startupTime = (performance.now() - startTime).toFixed(2);
        logger.verbose(`Environment:     ${process.env['NODE_ENV'] || 'development'}`);
        logger.verbose(`API Endpoint:    ${baseUrl}`);
        logger.verbose(`Health Check:    ${baseUrl}/health`);
        logger.verbose(`Swagger UI:      ${swaggerBase}/${swaggerPath}`);
        logger.verbose(`OpenAPI (Specs): ${swaggerBase}/${swaggerPath}/s/{json,yaml}`);
        logger.verbose(`Boot Time:       ${startupTime}ms`);
    });
}
