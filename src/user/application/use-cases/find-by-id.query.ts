import { IUserRepository } from '@core/user/domain/repository';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindByIdQuery {
    constructor(@Inject('IUserRepository') private readonly userRepo: IUserRepository) {}

    async execute(id: string) {
        return this.userRepo.findById(id);
    }
}
