import { BetStatus, Position } from 'src/configuration/type';
import { Prediction } from './prediction.enity';
import { Market } from './market.entity';
import { Dice } from './dice.entity';

export class Bet {
  id?: string;

  epoch: number;

  position: Position;

  user_address: string;

  claimed: boolean;

  refund: number;

  winning_amount: number;

  amount: number;

  claimed_amount: number;

  status: BetStatus;

  round: Prediction | Market | Dice;

  created_at: number;

  delete: boolean;
}
