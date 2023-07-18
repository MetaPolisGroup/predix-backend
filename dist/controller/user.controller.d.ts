import { Request } from "express";
import { User } from "src/core/schema/user.schema";
import { UserService } from "src/use-case/user/user.service";
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(data: User, req: Request): Promise<User>;
}
