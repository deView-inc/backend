import { IUserRepository } from '@core/user/domain/repository';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindByEmailQuery {
    constructor(@Inject('IUserRepository') private readonly userRepo: IUserRepository) {}

    async execute(email: string) {
        return this.userRepo.findByEmail(email.toLowerCase());
    }
}
