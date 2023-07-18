import { Document } from "mongoose";
export declare class User extends Document {
    account_id: string;
    balance: number;
    point: number;
    email: string;
    password: string;
    ip: string;
    nickname: string;
    created_at: number;
    updated_at: number;
}
export declare const UserSchema: any;
