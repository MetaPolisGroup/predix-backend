import { Prediction } from './prediction.enity';

export class Bet {
  id?: string;

  epoch: string;

  position: Position;

  user_address: string;

  claimed: boolean;

  refund: number;

  amount: number;

  claimed_amount: number;

  status: 'Win' | 'Lose' | 'Refund' | 'Waiting';

  round: Prediction;

  created_at: number;

  delete: boolean;
}

export type Position = 'UP' | 'DOWN';
