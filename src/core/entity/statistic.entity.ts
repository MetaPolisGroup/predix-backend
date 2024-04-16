import { Generic } from './generic.entity';

export class Statistic extends Generic {
    min_profit_expected_amount: number;

    max_profit_expected_amount: number;

    current_profit_percent: number;

    current_profit: number;

    total_volume: number;

    from: number;

    to: number;
}
