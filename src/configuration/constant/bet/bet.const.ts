import { BetStatus, Position } from 'src/configuration/type';

export const betStatus = {
  DICE: 'Live' as BetStatus,
  LOSE: 'Lose' as BetStatus,
  LOSING_REFUND: 'Losing Refund' as BetStatus,
  REFUND: 'Refund' as BetStatus,
  WAITING: 'Waiting' as BetStatus,
  WIN: 'Win' as BetStatus,
  WINNING_REFUND: 'Winning Refund' as BetStatus,
};

export const betPosition = {
  UP: 'UP' as Position,
  DOWN: 'DOWN' as Position,
};
