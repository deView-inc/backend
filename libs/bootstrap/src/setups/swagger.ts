import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalErrorResponse } from '@shared/error/schema';
import { cleanupOpenApiDoc } from 'nestjs-zod';

import { SWAGGER_DEFAULTS } from '../configs/swagger';
import type { SwaggerOptions } from '../interfaces';

async function getCustomCSS() {
    const rawUrl = 'https://gist.githubusercontent.com/soorq/f745e5c44cfe27aa928048d6d4ccb18a/raw',
        res = await fetch(rawUrl);
    if (!res.ok) {
        return '';
    }
    return res.text();
}

export async function setupSwagger(app: NestFastifyApplication, options: SwaggerOptions = {}) {
    const {
            title = 'Api',
            description = '',
            version = 'v0.0.1',
            path = 'api',
            server,
        } = {
            ...SWAGGER_DEFAULTS,
            ...options,
        },
        { domain, port, stage } = server || {},
        builder = new DocumentBuilder()
            .setTitle(title)
            .setDescription(description)
            .setVersion(version)
            .addBearerAuth();

    if ((!stage || !domain) && port) {
        builder.addServer(`http://localhost:${port}`, 'Local');
    }
    if (stage) {
        builder.addServer(`https://api.${stage}`, 'Staging');
    }
    if (domain) {
        builder.addServer(`https://api.${domain}`, 'Production');
    }

    const document = SwaggerModule.createDocument(app, builder.build(), {
            extraModels: [GlobalErrorResponse.Output],
        }),
        customCss = await getCustomCSS().catch(() => '');

    SwaggerModule.setup(path, app, cleanupOpenApiDoc(document), {
        customCss,
        jsonDocumentUrl: `${path}/s/json`,
        swaggerOptions: {
            operationsSorter: 'alpha',
            persistAuthorization: true,
            tagsSorter: 'alpha',
        },
        ui: true,
        useGlobalPrefix: true,
        yamlDocumentUrl: `${path}/s/yaml`,
    });
}
