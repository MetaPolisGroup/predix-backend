import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { Bet } from 'src/core/entity/bet.entity';
import { Prophecy } from 'src/core/entity/manipulation.entity';
import { Prediction } from 'src/core/entity/prediction.enity';
import { BotPreferences } from 'src/core/entity/preferences.entity';
import { Statistic } from 'src/core/entity/statistic.entity';
import { BetPredictionService } from 'src/use-case/bet/prediction/bet-prediction.service';
import { PredictionRoundService } from 'src/use-case/games/prediction/prediction-round.service';
import { HelperService } from 'src/use-case/helper/helper.service';
import { PreferenceService } from 'src/use-case/preference/preference.service';

@Injectable()
export class PredixStatisticService implements OnApplicationBootstrap {
    constructor(
        private readonly helper: HelperService,
        private readonly db: IDataServices,
        private readonly preference: PreferenceService,
        private readonly betPredix: BetPredictionService,
        private readonly predixRound: PredictionRoundService,
    ) {}

    async onApplicationBootstrap() {
        await this.reCalculateVolumeAfterReboot();
        await this.reCalculateProfitAfterReboot();
    }

    private async reCalculateVolumeAfterReboot() {
        const preference = await this.preference.getPredixBotProfitPreference();
        const rounds = await this.predixRound.getIncludeRoundFrom(this.helper.getTimestampAtBeginningOfDayInSeconds());
        let total_volume = 0;

        if (rounds) {
            for (const round of rounds) {
                total_volume += round.total_amount;
            }
        }

        const currentStatisic = await this.getCurrentStatistic();

        await this.db.statisticRepo.upsertDocumentData(currentStatisic.id, {
            total_volume,
            min_profit_expected_amount: (preference.min_profit_percent / 100) * total_volume,
            max_profit_expected_amount: (preference.max_profit_percent / 100) * total_volume,
        });
    }

    private async reCalculateProfitAfterReboot() {
        const bets = await this.betPredix.getBotBetsHasResultOfIncludedRoundFrom(
            this.helper.getTimestampAtBeginningOfDayInSeconds(),
        );
        let current_profit = 0;
        let current_profit_percent = 0;
        if (bets) {
            for (const bet of bets) {
                current_profit += bet.net;
            }
        }
        const statistic = await this.getCurrentStatistic();

        current_profit_percent = (current_profit / statistic.total_volume) * 100;

        await this.db.statisticRepo.upsertDocumentData(statistic.id, { current_profit, current_profit_percent });
    }

    async statisticCheck() {
        const { current_profit, min_profit_expected_amount, max_profit_expected_amount } =
            await this.getCurrentStatistic();
        let prophecy: Prophecy;
        if (current_profit < min_profit_expected_amount) {
            prophecy = 'Win';
        } else if (current_profit > max_profit_expected_amount) {
            prophecy = 'Lose';
        } else {
            return null;
        }

        return prophecy;
    }

    private calculateCurrentProfit(bet: Bet, { current_profit, current_profit_percent, total_volume }: Statistic) {
        current_profit += bet.net;
        current_profit_percent = (current_profit / total_volume) * 100;
        return { current_profit, current_profit_percent };
    }

    async calculateCurrentProfitAndUpdate(bet: Bet) {
        const currentStatisic = await this.getCurrentStatistic();
        const { current_profit, current_profit_percent } = this.calculateCurrentProfit(bet, currentStatisic);

        return this.upsertStatistic(currentStatisic.id, { current_profit, current_profit_percent });
    }

    private calculateVolume(
        { total_amount }: Prediction,
        { min_profit_percent, max_profit_percent }: BotPreferences,
        statistic: Statistic,
    ) {
        let { total_volume, min_profit_expected_amount, max_profit_expected_amount } = statistic;

        total_volume += total_amount;
        min_profit_expected_amount = (min_profit_percent / 100) * total_volume;
        max_profit_expected_amount = (max_profit_percent / 100) * total_volume;

        return { min_profit_expected_amount, max_profit_expected_amount, total_volume };
    }

    async calculateVolumeAndUpdate(round: Prediction) {
        const botPreferences = await this.preference.getPredixBotProfitPreference();
        const currentStatisic = await this.getCurrentStatistic();
        const { total_volume, min_profit_expected_amount, max_profit_expected_amount } = this.calculateVolume(
            round,
            botPreferences,
            currentStatisic,
        );

        return this.upsertStatistic(currentStatisic.id, {
            min_profit_expected_amount,
            max_profit_expected_amount,
            total_volume,
        });
    }

    async upsertCurrentStatistic(statistic: Statistic | object) {
        const currentStatisic = await this.getCurrentStatistic();
        return this.upsertStatistic(currentStatisic.id, statistic);
    }

    async upsertStatistic(id: string, statistic: Statistic | object) {
        return this.db.statisticRepo.upsertDocumentData(id, statistic);
    }

    async getCurrentStatistic() {
        const now = this.helper.getNowTimeStampsSeconds();
        const statistic = await this.db.statisticRepo.getFirstValueCollectionDataByConditions([
            {
                field: 'from',
                operator: '<=',
                value: now,
            },
            {
                field: 'to',
                operator: '>=',
                value: now,
            },
        ]);

        if (!statistic) {
            return this.createStatistic();
        }

        return statistic;
    }

    private async createStatistic() {
        const preference = await this.preference.getPredixBotProfitPreference();
        if (!preference) {
            return;
        }

        const { from, to } = this.getTimeStamp(preference.span_unit);

        return this.db.statisticRepo.createDocumentData(this._createStatistic(from, to));
    }

    private _createStatistic(from: number, to: number) {
        const s: Statistic = {
            created_at: this.helper.getNowTimeStampsSeconds(),
            current_profit: 0,
            current_profit_percent: 0,
            deleted: null,
            deleted_at: null,
            from,
            to,
            max_profit_expected_amount: 0,
            min_profit_expected_amount: 0,
            total_volume: 0,
            updated_at: this.helper.getNowTimeStampsSeconds(),
        };

        return s;
    }

    private getTimeStamp(unit: 'day' | 'month' | 'year') {
        const now = new Date();
        let start: Date;
        let end: Date;

        switch (unit) {
            case 'day':
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
                end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
                break;
            case 'month':
                start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                break;
            case 'year':
                start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
                end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
                break;
            default:
                throw new Error("Invalid unit. Supported units are 'day', 'month', and 'year'.");
        }

        return { from: Math.round(start.getTime() / 1000), to: Math.round(end.getTime() / 1000) };
    }
}
