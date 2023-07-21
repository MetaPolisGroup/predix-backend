import { Request } from 'express';
import { CreateUserDto } from 'src/core/dtos/user/user.dto';
import { User } from 'src/core/entity/user.enity';
import { UserService } from 'src/use-case/user/user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(dto: CreateUserDto, req: Request): Promise<User>;
}
