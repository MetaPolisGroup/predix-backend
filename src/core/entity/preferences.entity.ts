import { Generic } from './generic.entity';

export class Preferences extends Generic {
    fee: number;

    interval_seconds?: number;

    genesis_start?: boolean;

    genesis_lock?: boolean;

    genesis_end?: boolean;

    paused: boolean;
}

export class BotPreferences extends Generic {
    min_profit_percent: number;

    max_profit_percent: number;

    span_unit: 'day' | 'month' | 'year';
}
