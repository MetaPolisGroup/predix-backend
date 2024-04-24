import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { User } from 'src/core/entity/user.enity';
import { HelperService } from '../helper/helper.service';

@Injectable()
export class UserUsecaseService implements OnApplicationBootstrap {
    constructor(
        private readonly db: IDataServices,
        private readonly helper: HelperService,
    ) {}

    onApplicationBootstrap() {}

    async upsertUser(id: string, user: Partial<User>) {
        return this.db.userRepo.upsertDocumentData(id, { ...user, updated_at: this.helper.getNowTimeStampsSeconds() });
    }

    async updateIncrement(id: string, fields: Partial<Record<keyof User, number>>) {
        return this.db.userRepo.updateDocumentIncrement(id, fields);
    }

    async create(id: string, user: User) {
        return this.db.userRepo.upsertDocumentData(id, { ...user, created_at: this.helper.getNowTimeStampsSeconds() });
    }

    async delete(id: string) {
        return this.db.userRepo.upsertDocumentData(id, {
            deleted: true,
            deleted_at: this.helper.getNowTimeStampsSeconds(),
        });
    }

    async getUserByAddress(address: string) {
        const user = await this.db.userRepo.getDocumentData(address);
        return user;
    }
}
