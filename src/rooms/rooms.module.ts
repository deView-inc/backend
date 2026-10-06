import { Module } from '@nestjs/common';

import { CONTROLLERS } from './application/controllers';
import { RoomsUseCases } from './application/use-cases';
import { RoomsFacade } from './rooms.facade';

@Module({
    controllers: CONTROLLERS,
    providers: [...RoomsUseCases, RoomsFacade],
})
export class RoomsModule {}
