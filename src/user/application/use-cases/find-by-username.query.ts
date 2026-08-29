import { IUserRepository } from '@core/user/domain/repository';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindByUsernameQuery {
    constructor(@Inject('IUserRepository') private readonly userRepo: IUserRepository) {}

    async execute(username: string) {
        return this.userRepo.findByUsername(username);
    }
}
