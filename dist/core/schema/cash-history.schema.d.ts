import { User } from "./user.schema";
export declare class CashHistory extends Document {
    user: User;
    product: string;
    point: string;
    amount: string;
    division: string;
    note: string;
    created_at: number;
    update_at: number;
}
export declare const CashHistorySchema: any;
