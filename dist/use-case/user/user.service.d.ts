import { Request } from 'express';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { CreateUserDto } from 'src/core/dtos/user/user.dto';
import { User } from 'src/core/entity/user.enity';
export declare class UserService {
    private readonly db;
    constructor(db: IDataServices);
    create(dto: CreateUserDto, req: Request): Promise<User>;
    partnerTree(recommend_id: string): Promise<any[]>;
}
