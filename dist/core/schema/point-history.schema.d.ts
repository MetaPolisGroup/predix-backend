import { User } from "./user.schema";
export declare class PointHistory extends Document {
    user: User;
    point: string;
    division: string;
    note: string;
    created_at: number;
    update_at: number;
}
export declare const PointHistorySchema: any;
