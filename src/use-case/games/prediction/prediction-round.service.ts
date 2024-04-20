import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import constant from 'src/configuration';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { Prediction, PredictionOnChain } from 'src/core/entity/prediction.enity';
import { HelperService } from 'src/use-case/helper/helper.service';
import { PreferenceService } from 'src/use-case/preference/preference.service';
import { Bet } from 'src/core/entity/bet.entity';
import { PredixOperatorContract } from 'src/use-case/contracts/predix/prediction-operator.service';

@Injectable()
export class PredictionRoundService implements OnApplicationBootstrap {
    private logger: ILogger;

    constructor(
        private readonly db: IDataServices,
        private readonly helper: HelperService,
        private readonly preference: PreferenceService,
        private readonly logFactory: ILoggerFactory,
        private readonly predixOperator: PredixOperatorContract,
    ) {
        this.logger = this.logFactory.predictionLogger;
    }

    async onApplicationBootstrap() {
        if (process.env.CONSTANT_ENABLE === 'True') {
            await this.updateContractState();
            await this.updateThreeLatestRounds(await this.predixOperator.getCurrentEpoch());
        }
    }

    private async updateContractState() {
        const genesis_start = await this.predixOperator.isGenesisStart();

        const genesis_lock = await this.predixOperator.isGenesisLock();

        const interval_seconds = await this.predixOperator.getIntervalSecond();

        const fee = await this.predixOperator.getTreasuryFee();

        const paused = await this.predixOperator.isPaused();

        await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.PREDICTION, {
            genesis_start,
            genesis_lock,
            interval_seconds,
            fee,
            paused,
        });
    }

    async cancelCurrentLiveRound() {
        const currentRounds = await this.db.predictionRepo.getCollectionDataByConditions([
            {
                field: 'closed',
                operator: '==',
                value: false,
            },
            {
                field: 'cancel',
                operator: '==',
                value: false,
            },
        ]);

        if (!currentRounds) {
            return;
        }

        for (const round of currentRounds) {
            await this.db.predictionRepo.upsertDocumentData(round.epoch.toString(), {
                cancel: true,
            });
        }
    }

    async createNewRound(epoch: number) {
        const preferences = await this.preference.getPredixPreference();
        const now = this.helper.getNowTimeStampsSeconds();

        if (!preferences) {
            return;
        }

        // Create round variable
        const round: Prediction = {
            epoch,
            closeOracleId: 0,
            lockOracleId: 0,
            up_amount: 0,
            down_amount: 0,
            total_amount: 0,
            result: 'WAIT',
            total_bets: 0,
            total_bets_down: 0,
            total_bets_up: 0,
            closePrice: 0,
            lockPrice: 0,
            startTimestamp: now,
            closeTimestamp: now + preferences.interval_seconds * 2,
            lockTimestamp: now + preferences.interval_seconds,
            include: false,
            closed: false,
            locked: false,
            cancel: false,
            deleted: false,
            created_at: this.helper.getNowTimeStampsSeconds(),
            updated_at: this.helper.getNowTimeStampsSeconds(),
            deleted_at: null,
        };
        await this.db.predictionRepo.upsertDocumentData(epoch.toString(), round);
    }

    async updateLockRound(round: Prediction, roundId: number, price: number) {
        // Update round

        round.lockOracleId = roundId;
        round.lockPrice = price;
        round.lockTimestamp = this.helper.getNowTimeStampsSeconds();
        round.locked = true;

        return this.db.predictionRepo.upsertDocumentData(round.epoch.toString(), round);
    }

    async includeRoundCheckToCalculateVolume(
        bets: Bet[],
        epoch: number,
        total_amount: number,
        index = 0,
    ): Promise<Bet[]> {
        if (!bets || total_amount <= 0 || index >= bets.length) {
            return bets;
        }

        const bet = bets[index];
        if (bet.after_refund_amount <= 0 || bet.user.type !== constant.USER.TYPE.NORMAL) {
            return this.includeRoundCheckToCalculateVolume(bets, epoch, total_amount, index + 1);
        }

        await this.db.predictionRepo.upsertDocumentData(epoch.toString(), {
            include: true,
        });
        return bets;
    }

    async updateEndRound(round: Prediction, roundId: number, price: number) {
        // Update round
        const excess = round.closePrice - round.lockPrice;
        round.closeOracleId = roundId;
        round.closePrice = price;
        round.closeTimestamp = this.helper.getNowTimeStampsSeconds();
        round.closed = true;
        round.cancel = round.total_amount <= 0;
        round.result = excess == 0 ? 'DRAW' : excess > 0 ? 'UP' : 'DOWN';

        await this.db.predictionRepo.upsertDocumentData(round.epoch.toString(), round);
    }

    async updateThreeLatestRounds(currentEpoch: number, index = 0) {
        if (currentEpoch <= index || index > 3) {
            return;
        }
        const epoch = currentEpoch - index;
        const round = await this.predixOperator.getRound(epoch);
        const roundOnDb = await this.getRoundByEpoch(epoch);
        const validRound = this.validateRound(roundOnDb, round, this.helper.getNowTimeStampsSeconds());

        await this.db.predictionRepo.upsertDocumentData(epoch.toString(), validRound);

        await this.updateThreeLatestRounds(currentEpoch, index + 1);
    }

    validateRound(round: Prediction, roundFromChain: PredictionOnChain, now: number) {
        const { lockOracleId, lockTimestamp, closeOracleId, closeTimestamp } = roundFromChain;

        round.locked = lockOracleId !== 0 && lockTimestamp < now;
        round.closed = closeOracleId !== 0 && closeTimestamp < now;
        round.cancel = round.closed && round.total_amount <= 0;

        return { ...round, ...roundFromChain } as Prediction;
    }

    async getCurrentRound() {
        const currentRound = await this.db.predictionRepo.getFirstValueCollectionDataByConditionsAndOrderBy(
            [
                {
                    field: 'cancel',
                    operator: '==',
                    value: false,
                },
                {
                    field: 'locked',
                    operator: '==',
                    value: false,
                },
            ],
            [
                {
                    field: 'epoch',
                    option: 'desc',
                },
            ],
        );
        return currentRound;
    }

    async getTotalAmountIncludedRoundFrom(from: number) {
        const total = await this.db.predictionRepo.getSumByConditions(
            [
                {
                    field: 'created_at',
                    operator: '>=',
                    value: from,
                },
                {
                    field: 'include',
                    operator: '==',
                    value: true,
                },
            ],
            'total_amount',
        );

        return total ?? 0;
    }

    async getTotalAmountIncludedRoundFromTo(from: number, to: number) {
        const total = await this.db.predictionRepo.getSumByConditions(
            [
                {
                    field: 'created_at',
                    operator: '>=',
                    value: from,
                },
                {
                    field: 'created_at',
                    operator: '<=',
                    value: to,
                },
                {
                    field: 'include',
                    operator: '==',
                    value: true,
                },
            ],
            'total_amount',
        );

        return total ?? 0;
    }

    async getRoundByEpoch(epoch: number) {
        const round = await this._getRoundByEpoch(epoch);
        const roundOnChain = await this.predixOperator.getRound(epoch);

        if (!round) {
            this.logger.error(`Round ${epoch.toString()} not found from DB!`);
        }
        return { ...round, ...roundOnChain } as Prediction;
    }

    async getIncludeRoundFrom(from: number) {
        const round = await this.db.predictionRepo.getCollectionDataByConditions([
            {
                field: 'include',
                operator: '==',
                value: true,
            },

            {
                field: 'created_at',
                operator: '>=',
                value: from,
            },
        ]);

        return round;
    }

    private async _getRoundByEpoch(epoch: number) {
        const round = await this.db.predictionRepo.getFirstValueCollectionDataByConditions([
            {
                field: 'epoch',
                operator: '==',
                value: parseInt(epoch.toString()),
            },
        ]);
        return round;
    }

    async getCurrentLiveRound() {
        const round = await this.db.predictionRepo.getFirstValueCollectionDataByConditionsAndOrderBy(
            [
                {
                    field: 'closed',
                    operator: '==',
                    value: false,
                },

                {
                    field: 'locked',
                    operator: '==',
                    value: true,
                },

                {
                    field: 'cancel',
                    operator: '==',
                    value: false,
                },
            ],
            [
                {
                    field: 'epoch',
                    option: 'desc',
                },
            ],
        );

        return round;
    }
}
