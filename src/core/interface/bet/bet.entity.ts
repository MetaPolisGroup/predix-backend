import { Round } from '../round/round.entity';

export class Bet {
  id?: string;

  epoch: string;

  position: Position;

  user_address: string;

  claimed: boolean;

  refund: number;

  amount: number;

  claimed_amount: number;

  round: Round;

  created_at: number;

  delete: boolean;
}

export type Position = 'UP' | 'DOWN';
