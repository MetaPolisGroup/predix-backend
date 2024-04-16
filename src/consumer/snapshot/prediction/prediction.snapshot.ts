import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { DocumentChange } from 'src/core/abstract/data-services/snapshot/Query.abstract';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { Prediction } from 'src/core/entity/prediction.enity';
import { PredixFakeBotService } from 'src/consumer/bots/prediction/predix-fake-bot.service';
import { HelperService } from 'src/use-case/helper/helper.service';
import { PredixOperatorContract } from 'src/use-case/contracts/predix/prediction-operator.service';
import { PredictionRoundService } from 'src/use-case/games/prediction/prediction-round.service';
import { PredixStatisticService } from 'src/use-case/statistic/predix/predix-statistic.service';
import { PredictionSchedulerService } from 'src/consumer/scheduler/predix/prediction-scheduler.service';
import { BetPredictionService } from 'src/use-case/bet/prediction/bet-prediction.service';
import { PreferenceService } from 'src/use-case/preference/preference.service';
import { ManipulationService } from 'src/use-case/manipulation/manipulation.service';
import { ManipulationUsecases } from 'src/use-case/manipulation/manipulation.usecases';

@Injectable()
export class PredictionSnapshotService implements OnApplicationBootstrap {
    private logger: ILogger;

    constructor(
        private readonly db: IDataServices,
        private readonly predixOperator: PredixOperatorContract,
        private readonly predixManipulate: ManipulationService,
        private readonly predixManipulateUsecase: ManipulationUsecases,
        private readonly logFactory: ILoggerFactory,
        private readonly predixFakeBotService: PredixFakeBotService,
        private readonly helper: HelperService,
        private readonly predixRound: PredictionRoundService,
        private readonly predixScheduler: PredictionSchedulerService,
        private readonly predixStatistic: PredixStatisticService,
        private readonly predixBet: BetPredictionService,
        private readonly preference: PreferenceService,
    ) {
        this.logger = this.logFactory.predictionLogger;
    }

    onApplicationBootstrap() {
        if (process.env.CONSTANT_ENABLE === 'True') {
            this.newRoundSnapshot(async change => {
                if (change.type !== 'added') {
                    return;
                }

                await this.predixScheduler.newRoundHandler(change.doc);

                // Check Prophecy
                const prophecy = await this.predixStatistic.statisticCheck();
                if (prophecy) {
                    this.predixManipulateUsecase.createManipulateionRecord(change.doc, prophecy);
                }

                this.predixFakeBotService.runFakeBots(change.doc, 2);
                this.predixFakeBotService.FakeUserBet(change.doc);
            });

            this.roundLockSnapshot(async change => {
                const bets = await this.predixBet.updateBetsWhenRoundIsLocked(
                    await this.predixBet.getBetsByEpoch(change.doc.epoch),
                    change.doc,
                );

                await this.predixRound.includeRoundCheckToCalculateVolume(
                    bets,
                    change.doc.epoch,
                    change.doc.total_amount,
                );
            });

            this.includeRoundLockSnapshot(async change => {
                await this.predixStatistic.calculateVolumeAndUpdate(change.doc);
            });

            this.roundEndSnapshot(async change => {
                await this.predixBet.updateBetsWhenRoundIsEnded(
                    await this.predixBet.getBetsByEpoch(change.doc.epoch),
                    change.doc,
                    await this.preference.getPredixPreference(),
                );
            });
        }

        if (process.env.CONSTANT_BOT === 'True') {
            //
        }
    }

    // Round start
    newRoundSnapshot(callBack: (change: DocumentChange<Prediction>) => Promise<void> | void) {
        return this.db.predictionRepo.listenToChangesWithConditionsAndOrderBy(
            [
                {
                    field: 'locked',
                    operator: '==',
                    value: false,
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
            async changes => {
                for (const change of changes) {
                    await callBack(change);
                }
            },
        );
    }

    // Round lock
    roundLockSnapshot(callBack: (change: DocumentChange<Prediction>) => Promise<void> | void) {
        return this.db.predictionRepo.listenToChangesWithConditionsAndOrderBy(
            [
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
                {
                    field: 'lockTimestamp',
                    operator: '>=',
                    value: this.helper.getNowTimeStampsSeconds(),
                },
            ],
            [
                {
                    field: 'epoch',
                    option: 'desc',
                },
            ],
            async changes => {
                for (const change of changes) {
                    await callBack(change);
                }
            },
        );
    }

    roundLockSnapshotByEpoch(epoch: number, callBack: (change: DocumentChange<Prediction>) => Promise<void> | void) {
        return this.db.predictionRepo.listenToChangesWithConditions(
            [
                {
                    field: 'epoch',
                    operator: '==',
                    value: epoch,
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
                {
                    field: 'closeTimestamp',
                    operator: '>=',
                    value: this.helper.getNowTimeStampsSeconds(),
                },
            ],

            async changes => {
                for (const change of changes) {
                    await callBack(change);
                }
            },
        );
    }

    includeRoundLockSnapshot(callBack: (change: DocumentChange<Prediction>) => Promise<void> | void) {
        return this.db.predictionRepo.listenToChangesWithConditionsAndOrderBy(
            [
                {
                    field: 'include',
                    operator: '==',
                    value: true,
                },
                {
                    field: 'lockTimestamp',
                    operator: '>=',
                    value: this.helper.getNowTimeStampsSeconds(),
                },
                {
                    field: 'result',
                    operator: '!=',
                    value: 'WAIT',
                },
            ],
            [
                {
                    field: 'epoch',
                    option: 'desc',
                },
            ],
            async changes => {
                for (const change of changes) {
                    await callBack(change);
                }
            },
        );
    }

    // Round end
    roundEndSnapshot(callBack: (change: DocumentChange<Prediction>) => Promise<void> | void) {
        return this.db.predictionRepo.listenToChangesWithConditions(
            [
                {
                    field: 'closed',
                    operator: '==',
                    value: true,
                },
                {
                    field: 'closeTimestamp',
                    operator: '>=',
                    value: this.helper.getNowTimeStampsSeconds(),
                },
                {
                    field: 'cancel',
                    operator: '==',
                    value: false,
                },
            ],
            async changes => {
                for (const change of changes) {
                    await callBack(change);
                }
            },
        );
    }

    roundEndSnapshotByEpoch(epoch: number, callBack: (change: DocumentChange<Prediction>) => Promise<void> | void) {
        return this.db.predictionRepo.listenToChangesWithConditions(
            [
                {
                    field: 'epoch',
                    operator: '==',
                    value: epoch,
                },
                {
                    field: 'closed',
                    operator: '==',
                    value: true,
                },
                {
                    field: 'cancel',
                    operator: '==',
                    value: false,
                },
                {
                    field: 'closeTimestamp',
                    operator: '>=',
                    value: this.helper.getNowTimeStampsSeconds(),
                },
            ],

            async changes => {
                for (const change of changes) {
                    await callBack(change);
                }
            },
        );
    }
}
