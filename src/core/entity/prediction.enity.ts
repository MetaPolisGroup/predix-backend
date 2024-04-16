import { Position } from 'src/configuration/type';
import { Generic } from './generic.entity';

export class PredictionOnChain extends Generic {
    epoch: number;

    startTimestamp: number;

    lockTimestamp: number;

    closeTimestamp: number;

    lockPrice: number;

    closePrice: number;

    lockOracleId: number;

    closeOracleId: number;

    total_amount: number;

    up_amount: number;

    down_amount: number;
}

export class Prediction extends PredictionOnChain {
    include: boolean;

    result: RoundResults;

    cancel: boolean;

    total_bets: number;

    total_bets_up: number;

    total_bets_down: number;

    closed: boolean;

    locked: boolean;
}

export type RoundResults = 'DRAW' | 'WAIT' | Position;
