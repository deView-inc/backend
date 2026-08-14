import { bootstrapApp } from '@libs/bootstrap';

import { AppModule } from './app.module';

bootstrapApp({
    appModule: AppModule,
    defaultPort: 2000,
    portEnvKey: 'PORT',
    serviceName: 'deView Monolit',
    swaggerOptions: {
        description: `
### Описание
RESTful API сервиса проведения технических собеседований и живым кодингом.

### Поддержка
Для доступа к закрытым методам используйте заголовок Authorization: Bearer token.
По вопросам интеграции обращаться к команде разработки.
    `.trim(),
        path: 'docs',
        title: 'deView API',
        version: '0.1.0',
    },
    useCookieParser: true,
    useCors: true,
    version: 'v1',
}).catch((error) => {
    console.error('Failed to bootstrap app:', error);
    process.exit(1);
});
