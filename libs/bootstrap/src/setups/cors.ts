import fastifyCors from '@fastify/cors';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';

export function setupCors(app: NestFastifyApplication, origins: readonly string[]) {
    app.getHttpAdapter()
        .getInstance()
        .register(fastifyCors, {
            origin: (origin, callback) => {
                // Server-to-server / curl / healthcheck
                if (!origin) {
                    return callback(null, true);
                }

                try {
                    const { hostname } = new URL(origin);
                    const allowedHostnames = origins.map((o) => new URL(o).hostname);

                    if (
                        allowedHostnames.some(
                            (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`),
                        )
                    ) {
                        return callback(null, origin);
                    }

                    callback(new Error('Not allowed by CORS'), false);
                } catch {
                    callback(new Error('Invalid origin format'), false);
                }
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
            preflightContinue: false,
            optionsSuccessStatus: 204,
        });
}
