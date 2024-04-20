import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { DocumentChange } from 'src/core/abstract/data-services/snapshot/Query.abstract';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { PredixStatisticService } from 'src/use-case/statistic/predix/predix-statistic.service';
import { Manipulation, ManipulationStatistic } from 'src/core/entity/manipulation.entity';
import { PredixBetSnapshotService } from '../../bet/predix-bet/predix-bet.snapshot';
import { ManipulationService } from 'src/use-case/manipulation/manipulation.service';
import { PredictionSnapshotService } from '../../prediction/prediction.snapshot';
import { UserService } from 'src/use-case/user/user.service';
import constant from 'src/configuration';
import { BetPredictionService } from 'src/use-case/bet/prediction/bet-prediction.service';
import { ManipulationUsecases } from 'src/use-case/manipulation/manipulation.usecases';
import { PredictionRoundService } from 'src/use-case/games/prediction/prediction-round.service';
import { HelperService } from 'src/use-case/helper/helper.service';

@Injectable()
export class ManipulationSnapshotService implements OnApplicationBootstrap {
    private logger: ILogger;

    constructor(
        private readonly logFactory: ILoggerFactory,
        private readonly db: IDataServices,
        private readonly predixBetSnapshot: PredixBetSnapshotService,
        private readonly predixRoundSnapshot: PredictionSnapshotService,
        private readonly predixRound: PredictionRoundService,
        private readonly predixStatistic: PredixStatisticService,
        private readonly predixBet: BetPredictionService,
        private readonly predixManipulation: ManipulationService,
        private readonly predixManipulationUsecases: ManipulationUsecases,
        private readonly helper: HelperService,
        private readonly userService: UserService,
    ) {
        this.logger = this.logFactory.predictionLogger;
    }

    onApplicationBootstrap() {
        this.manipulatetionRecordListener();
    }

    manipulatetionRecordListener() {
        this.newManipulationRecordSnapshot(change => {
            if (change.type !== 'added') {
                return;
            }
            // this.manipulateRoundBetsListener(change.doc);

            const roundLockUnsub = this.predixRoundSnapshot.roundLockSnapshotByEpoch(change.doc.epoch, async change => {
                const manipulation = await this.predixManipulationUsecases.getManipulationByEpoch(change.doc.epoch);

                const botPosition = this.predixManipulation.calculateBotPosition(
                    await this.predixBet.getTotalBotBetsUpAmountByEpoch(change.doc.epoch),
                    await this.predixBet.getTotalBotBetsDownAmountByEpoch(change.doc.epoch),
                );

                const { manipulated_closed_price, position } = this.predixManipulation.decideWinPosition(
                    manipulation.prophecy_result,
                    botPosition,
                    change.doc,
                );

                this.predixManipulationUsecases.upsertManipulation(change.doc.epoch, {
                    bot_position: botPosition,
                    manipulated_closed_price,
                    position,
                    round: change.doc,
                });
                roundLockUnsub();
            });

            const roundEndUnsub = this.predixRoundSnapshot.roundEndSnapshotByEpoch(change.doc.epoch, async change => {
                const total_volume = await this.predixRound.getTotalAmountIncludedRoundFromTo(
                    this.helper.getTimestampAtBeginningOfDayInSeconds(),
                    change.doc.created_at,
                );

                const current_profit = await this.predixBet.getTotalFinishedBotBetsNetOfIncludedRoundFromTo(
                    this.helper.getTimestampAtBeginningOfDayInSeconds(),
                    change.doc.created_at,
                );

                const { preference } = await this.predixStatistic.getCurrentStatistic();

                const statistic: ManipulationStatistic = {
                    total_volume,
                    current_profit,
                    current_profit_percent: (current_profit / total_volume) * 100,
                    min_profit_expected_amount: (preference.min_profit_percent / 100) * total_volume,
                    max_profit_expected_amount: (preference.max_profit_percent / 100) * total_volume,
                };

                this.predixManipulationUsecases.upsertManipulation(change.doc.epoch, {
                    round: change.doc,
                    statistic,
                });

                roundEndUnsub();
            });
        });
    }

    private manipulateRoundBetsListener(round: Manipulation) {
        const manipulateRoundBotBetDownUnsub = this.predixBetSnapshot.betSnapshotByEpochAndUserTypeAndPosition(
            constant.BET.POS.DOWN,
            round.epoch,
            constant.USER.TYPE.BOT,
            async change => {
                await this.predixManipulationUsecases.updateRecordBotBetDown(
                    change.doc,
                    await this.predixManipulationUsecases.getManipulationByEpoch(change.doc.epoch),
                );
            },
        );

        const manipulateRoundBotBetUpUnsub = this.predixBetSnapshot.betSnapshotByEpochAndUserTypeAndPosition(
            constant.BET.POS.UP,
            round.epoch,
            constant.USER.TYPE.BOT,
            async change => {
                await this.predixManipulationUsecases.updateRecordBotBetUp(
                    change.doc,
                    await this.predixManipulationUsecases.getManipulationByEpoch(change.doc.epoch),
                );
            },
        );

        const manipulateRoundUserBetDownUnsub = this.predixBetSnapshot.betSnapshotByEpochAndUserTypeAndPosition(
            constant.BET.POS.DOWN,
            round.epoch,
            constant.USER.TYPE.NORMAL,
            async change => {
                await this.predixManipulationUsecases.updateRecordUserBetDown(
                    change.doc,
                    await this.predixManipulationUsecases.getManipulationByEpoch(change.doc.epoch),
                );
            },
        );

        const manipulateRoundUserBetUpUnsub = this.predixBetSnapshot.betSnapshotByEpochAndUserTypeAndPosition(
            constant.BET.POS.UP,
            round.epoch,
            constant.USER.TYPE.NORMAL,
            async change => {
                await this.predixManipulationUsecases.updateRecordUserBetUp(
                    change.doc,
                    await this.predixManipulationUsecases.getManipulationByEpoch(change.doc.epoch),
                );
            },
        );

        const manipulateRoundLockUnsub = this.predixRoundSnapshot.roundLockSnapshotByEpoch(round.epoch, () => {
            manipulateRoundBotBetDownUnsub();
            manipulateRoundBotBetUpUnsub();
            manipulateRoundUserBetDownUnsub();
            manipulateRoundUserBetUpUnsub();
            manipulateRoundLockUnsub();
        });
    }

    private newManipulationRecordSnapshot(callBack: (change: DocumentChange<Manipulation>) => Promise<void> | void) {
        return this.db.manipulationRepo.listenToChanges(async changes => {
            for (const change of changes) {
                await callBack(change);
            }
        });
    }
}
