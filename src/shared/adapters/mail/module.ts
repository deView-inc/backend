import { Global, Module } from '@nestjs/common';

import { MailAdapter } from './adapter';
import { MAIL_SERVICE } from './constants';

@Global()
@Module({
    providers: [
        {
            provide: MAIL_SERVICE,
            useClass: MailAdapter,
        },
    ],
    exports: [MAIL_SERVICE],
})
export class MailModule {}
