import { BetStatus, Position } from 'src/configuration/type';
import { Prediction } from './prediction.enity';
import { Market } from './market.entity';
import { Dice } from './dice.entity';
import { Generic } from './generic.entity';
import { User } from './user.enity';

export class Bet extends Generic {
    epoch: number;

    hash?: string;

    position: Position;

    user_address: string;

    amount: number;

    after_refund_amount: number;

    claimed: boolean;

    claim_amount: number;

    refund: number;

    winning_amount: number;

    net: number;

    net_after_fee: number;

    status: BetStatus;

    user: User;

    round: Prediction | Market | Dice;
}
