import { Request } from "express";
import mongoose from "mongoose";
import { User } from "src/core/schema/user.schema";
export declare class UserService {
    private readonly user;
    constructor(user: mongoose.Model<User>);
    create(data: User, req: Request): Promise<User>;
}
