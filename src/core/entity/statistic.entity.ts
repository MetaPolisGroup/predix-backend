import { Generic } from './generic.entity';
import { BotPreferences } from './preferences.entity';

export class Statistic extends Generic {
    min_profit_expected_amount: number;

    max_profit_expected_amount: number;

    current_profit_percent: number;

    current_profit: number;

    total_volume: number;

    from: number;

    to: number;

    preference: StatisticPreference;
}

export type StatisticPreference = Pick<BotPreferences, 'max_profit_percent' | 'min_profit_percent'>;
