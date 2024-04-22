import { Injectable } from '@nestjs/common';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { User } from 'src/core/entity/user.enity';

@Injectable()
export class UserUsecaseService {
    constructor(private readonly db: IDataServices) {}

    async upsertUser(id: string, user: User) {
        return this.db.userRepo.upsertDocumentData(id, user);
    }

    async getUserByAddress(address: string) {
        const user = await this.db.userRepo.getDocumentData(address);
        return user;
    }
}
