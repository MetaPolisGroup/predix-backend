import { Injectable } from '@nestjs/common';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';

@Injectable()
export class UserService {
    constructor(private readonly db: IDataServices) {}

    async getUserByAddress(address: string) {
        const user = await this.db.userRepo.getDocumentData(address);
        return user;
    }
}
