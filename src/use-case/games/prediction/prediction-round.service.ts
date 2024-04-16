import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import constant from 'src/configuration';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { ContractGenericAbstract } from 'src/core/abstract/contract-factory/contract-generic.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { Prediction } from 'src/core/entity/prediction.enity';

import { HelperService } from 'src/use-case/helper/helper.service';
import { PreferenceService } from 'src/use-case/preference/preference.service';
import { UserService } from 'src/use-case/user/user.service';
import { Bet } from 'src/core/entity/bet.entity';
import { PredixOperatorContract } from 'src/use-case/contracts/predix/prediction-operator.service';

@Injectable()
export class PredictionRoundService implements OnApplicationBootstrap {
    private logger: ILogger;

    constructor(
        private readonly db: IDataServices,
        private readonly helper: HelperService,
        private readonly preference: PreferenceService,
        private readonly factory: ContractFactoryAbstract,
        private readonly logFactory: ILoggerFactory,
        private readonly predixOperator: PredixOperatorContract,
        private readonly userService: UserService,
    ) {
        this.logger = this.logFactory.predictionLogger;
    }

    async onApplicationBootstrap() {
        if (process.env.CONSTANT_ENABLE === 'True') {
            await this.updateContractState();
            await this.updateThreeLatestRounds();
            // await this.validateAllNoCancelRound();
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

    async includeRoundCheckToCalculateVolume(bets: Bet[], epoch: number, total_amount: number, index = 0) {
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

    // async validateRound(epoch: number): Promise<object> {
    //     const now = this.helper.getNowTimeStampsSeconds();
    //     const currentEpoch = await this.predixOperator.getCurrentEpoch();
    //     const roundFromChain = await this.predixOperator.getRound(epoch);
    //     const bets = await this.
    //     const include = await this.includeRoundCheckToCalculateVolume()

    //     const round: Prediction = {
    //         ...roundFromChain,
    //         include : this.includeRoundCheckToCalculateVolume()
    //         cancel: null,
    //         locked: roundFromChain.lockOracleId !== 0 && roundFromChain.lockTimestamp < now,
    //         closed: roundFromChain.closeOracleId !== 0 && roundFromChain.closeTimestamp < now,

    //     };
    //     round.cancel = (round.closed && round.total_amount <= 0) || (!round.locked && currentEpoch > round.epoch);
    //     return round;
    // }

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

    async updateThreeLatestRounds() {
        const currentEpoch = await this.predixOperator.getCurrentEpoch();

        // Update Current round
        if (currentEpoch > 0) {
            const currentRound = await this.predixOperator.getRound(currentEpoch);
            await this.db.predictionRepo.upsertDocumentData(currentEpoch.toString(), currentRound);
        }

        if (currentEpoch > 1) {
            // Update Live round
            const liveRound = await this.predixOperator.getRound(currentEpoch - 1);
            await this.db.predictionRepo.upsertDocumentData((currentEpoch - 1).toString(), liveRound);
        }

        if (currentEpoch > 2) {
            const expiredRound = await this.predixOperator.getRound(currentEpoch - 2);
            await this.db.predictionRepo.upsertDocumentData((currentEpoch - 2).toString(), expiredRound);
        }
    }

    // async validateAllNoCancelRound() {
    //     const rounds = await this.db.predictionRepo.getCollectionDataByConditions([
    //         {
    //             field: 'cancel',
    //             operator: '==',
    //             value: false,
    //         },
    //     ]);
    //     if (rounds) {
    //         for (const r of rounds) {
    //             await this.db.predictionRepo.upsertDocumentData(r.epoch.toString(), { cancel: true });
    //         }
    //     }
    // }

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

    async getRoundByEpoch(epoch: number) {
        const round = await this._getRoundByEpoch(epoch);
        const roundFromChain = await this.predixOperator.getRound(epoch);

        if (!round) {
            this.logger.error(`Round ${epoch.toString()} not found from DB!`);
        }
        const d: Prediction = { ...round, ...roundFromChain };

        return d;
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
