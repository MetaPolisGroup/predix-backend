import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
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
import { PredixBotControlService } from 'src/use-case/control-panel/predix/predix-bot-control.service';
import { PredixControlService } from 'src/use-case/control-panel/predix/predix-control.services';
import { UserUsecaseService } from 'src/use-case/user/user.service';
import { CommissionService } from 'src/use-case/commission/commission.service';
import { CommssionConsumer } from 'src/consumer/commission/commisson.consumer';

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
        private readonly commissionService: CommissionService,
        private readonly userService: UserUsecaseService,

        private readonly predixControl: PredixControlService,
        private readonly predixBotControl: PredixBotControlService,
        private readonly commissionConsumer: CommssionConsumer,
    ) {
        this.logger = this.logFactory.predictionLogger;
    }

    onApplicationBootstrap() {}

    predixSnapshot() {
        // New Round snapshot
        const newRoundUnsub = this.newRoundSnapshot(async change => {
            if (change.type !== 'added') {
                return;
            }

            // schedule execute round
            await this.predixScheduler.newRoundHandler(change.doc);

            // Check Prophecy
            const { current_profit, min_profit_expected_amount, max_profit_expected_amount } =
                await this.predixStatistic.getCurrentStatistic();

            const prophecy = this.predixStatistic.statisticCheck(
                current_profit,
                min_profit_expected_amount,
                max_profit_expected_amount,
            );
            if (prophecy) this.predixManipulateUsecase.createManipulateionRecord(change.doc, prophecy);

            // Run Bots
            if (await this.predixBotControl.PredixBotEnable()) {
                this.predixFakeBotService.FakeUserBet(change.doc);
                this.predixFakeBotService.runFakeBots(change.doc, 2);
            }
        });

        // Lock round snapshot
        const lockRoundUnsub = this.roundLockSnapshot(async change => {
            // Update round
            const bets = await this.predixBet.updateBetsWhenRoundIsLocked(
                await this.predixBet.getBetsByEpoch(change.doc.epoch),
                change.doc,
            );

            // Calculate commission
            if (bets && bets.length > 0) {
                for (const bet of bets) {
                    if (bet.after_refund_amount <= 0 || bet.user.type === 'Bot') continue;

                    const user = await this.userService.getUserByAddress(bet.user_address);
                    // indirect comp
                    this.commissionService.calculateIndirectCommission(
                        user.user_tree_belong,
                        bet.after_refund_amount,
                        compObj => {
                            this.commissionConsumer.handleIndirectComp(bet, compObj.commission, compObj.user_address);
                        },
                    );

                    // direct comp
                    this.commissionConsumer.handleDirectComp(bet);
                }
            }

            // check if round is included in total volume
            await this.predixRound.includeRoundCheckToCalculateVolume(bets, change.doc.epoch, change.doc.total_amount);
        });

        // Included round snapshot
        const includedRoundUnsub = this.includeRoundLockSnapshot(async change => {
            await this.predixStatistic.calculateVolumeAndUpdate(change.doc);
        });

        // Round end snapshot
        const roundEndUnsub = this.roundEndSnapshot(async change => {
            await this.predixBet.updateBetsWhenRoundIsEnded(
                await this.predixBet.getBetsByEpoch(change.doc.epoch),
                change.doc,
                await this.preference.getPredixPreference(),
            );
        });
        return () => {
            newRoundUnsub();
            lockRoundUnsub();
            includedRoundUnsub();
            roundEndUnsub();
        };
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
