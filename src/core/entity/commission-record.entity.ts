import { Generic } from './generic.entity';
import { User } from './user.enity';

export type CommissionRecord = {
    sender: Pick<User, 'address' | 'type'>;

    receiver: Pick<User, 'address' | 'type'>;

    amount: number;

    before_amount: number;

    after_amount: number;

    type: CommissionType;

    epoch?: number;
} & Generic;

export type CommissionType = 'Withdraw' | 'Indirect' | 'Direct';
