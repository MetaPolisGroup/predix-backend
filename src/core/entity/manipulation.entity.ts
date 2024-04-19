import { Position } from 'src/configuration/type/bet';
import { Generic } from './generic.entity';
import { Prediction } from './prediction.enity';
import { Statistic } from './statistic.entity';

export class Manipulation extends Generic {
    epoch: number;

    position: Position;

    prophecy_result: Prophecy;

    bot_position: Position;

    total_user_bet_up: number;

    total_user_bet_down: number;

    total_bot_bet_down: number;

    total_bot_bet_up: number;

    profitable_amount: number;

    chart_structure: ChartStructure;

    suspended: boolean;

    manipulated_closed_price: number;

    chainlink_price: number;

    round: Prediction;

    statistic: Statistic;
}

export class ChartStructure {
    [time: string]: number;
}

export type Decision = {
    position: Manipulation['position'];
    manipulated_closed_price: Manipulation['manipulated_closed_price'];
};

export type Prophecy = 'Win' | 'Lose' | 'Draw';

export type ProphecyHandlers = {
    [id in `${Prophecy}-${Position}`]: (round: Prediction) => Decision;
};
