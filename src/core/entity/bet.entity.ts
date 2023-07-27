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

  status: 'Win' | 'Lose' | 'Refund' | 'Waiting' | 'Live';

  round: Prediction;

  created_at: number;

  delete: boolean;
}

export type Position = 'UP' | 'DOWN';
