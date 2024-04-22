import { BetStatus, Position } from 'src/configuration/type';

export const betStatus = {
    LIVE: 'Live' as BetStatus,
    LOSE: 'Lose' as BetStatus,
    REFUND: 'Refund' as BetStatus,
    WAITING: 'Waiting' as BetStatus,
    WIN: 'Win' as BetStatus,
};

export const betPosition = {
    UP: 'UP' as Position,
    DOWN: 'DOWN' as Position,
};
