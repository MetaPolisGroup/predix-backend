import { Prediction } from './prediction.enity';

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

  round: Prediction;

  created_at: number;

  delete: boolean;
}

export type BetStatus = 'Win' | 'Winning Refund' | 'Lose' | 'Losing Refund' | 'Refund' | 'Waiting' | 'Live';

export type Position = 'UP' | 'DOWN';
