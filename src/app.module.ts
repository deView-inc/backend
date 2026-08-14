import { ConfigModule } from '@libs/config';
import { Module } from '@nestjs/common';

@Module({
    controllers: [],
    imports: [ConfigModule],
    providers: [],
})
export class AppModule {}
