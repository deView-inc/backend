import { TasksModule } from '@core/tasks/tasks.module';
import { Module } from '@nestjs/common';

import { CONTROLLERS } from './application/controllers';
import { RoomsUseCases } from './application/use-cases';
import { RoomRepository } from './infrastructure/persistence/repositories';
import { RoomsFacade } from './rooms.facade';

const REPOSITORY = {
    provide: 'IRoomRepository',
    useClass: RoomRepository,
};

@Module({
    imports: [TasksModule],
    controllers: CONTROLLERS,
    providers: [...RoomsUseCases, RoomsFacade, REPOSITORY],
})
export class RoomsModule {}
