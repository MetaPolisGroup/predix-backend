import { Generic } from './generic.entity';

export class CashHistory extends Generic {
    user_id: string;

    product: string;

    point: string;

    amount: string;

    division: string;

    note: string;
}
