import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import constant from 'src/configuration';
import { Position } from 'src/configuration/type';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { DocumentChange } from 'src/core/abstract/data-services/snapshot/Query.abstract';
import { Bet } from 'src/core/entity/bet.entity';
import { UserType } from 'src/core/entity/user.enity';
import { BetPredictionService } from 'src/use-case/bet/prediction/bet-prediction.service';
import { HelperService } from 'src/use-case/helper/helper.service';
import { PredixStatisticService } from 'src/use-case/statistic/predix/predix-statistic.service';
import { UserUsecaseService } from 'src/use-case/user/user.service';

@Injectable()
export class PredixBetSnapshotService implements OnApplicationBootstrap {
    constructor(
        private readonly db: IDataServices,
        private readonly helper: HelperService,
        private readonly predixStatistic: PredixStatisticService,
        private readonly predixBet: BetPredictionService,
        private readonly user: UserUsecaseService,
    ) {}

    onApplicationBootstrap() {
        this.botBetHasResultAndIncludedInVolumeSnapshot(change => {
            this.predixStatistic.calculateCurrentProfitAndUpdate(change.doc);
        });
        this.betFinishSnapshot(async change => {
            const calculatedUser = this.predixBet.handleUpdateUserStatistic(
                await this.user.getUserByAddress(change.doc.user_address),
                change.doc,
            );

            this.user.upsertUser(calculatedUser.id, calculatedUser);
        });
    }

    betSnapshotByEpoch(epoch: number, callBack: (change: DocumentChange<Bet>) => Promise<void> | void) {
        return this.db.betRepo.listenToChangesWithConditions(
            [
                {
                    field: 'epoch',
                    operator: '==',
                    value: epoch,
                },
                { field: 'created_at', operator: '>=', value: this.helper.getNowTimeStampsSeconds() },
            ],
            async changes => {
                for (const change of changes) {
                    await callBack?.(change);
                }
            },
        );
    }

    betFinishSnapshot(callBack: (change: DocumentChange<Bet>) => Promise<void> | void) {
        return this.db.betRepo.listenToChangesWithConditions(
            [
                {
                    field: 'status',
                    operator: 'not-in',
                    value: [constant.BET.STATUS.WAITING, constant.BET.STATUS.REFUND],
                },
                { field: 'created_at', operator: '>=', value: this.helper.getNowTimeStampsSeconds() },
            ],
            async changes => {
                for (const change of changes) {
                    await callBack?.(change);
                }
            },
        );
    }

    betSnapshotByEpochAndUserTypeAndPosition(
        position: Position,
        epoch: number,
        userType: UserType,
        callBack: (change: DocumentChange<Bet>) => Promise<void> | void,
    ) {
        return this.db.betRepo.listenToChangesWithConditions(
            [
                {
                    field: 'epoch',
                    operator: '==',
                    value: epoch,
                },
                {
                    field: 'position',
                    operator: '==',
                    value: position,
                },
                {
                    field: 'user.type',
                    operator: '==',
                    value: userType,
                },
                { field: 'created_at', operator: '>=', value: this.helper.getNowTimeStampsSeconds() },
            ],
            async changes => {
                for (const change of changes) {
                    await callBack?.(change);
                }
            },
        );
    }

    botBetHasResultAndIncludedInVolumeSnapshot(callBack: (change: DocumentChange<Bet>) => Promise<void> | void) {
        return this.db.betRepo.listenToChangesWithConditions(
            [
                {
                    field: 'round.include',
                    operator: '==',
                    value: true,
                },
                {
                    field: 'user.type',
                    operator: '==',
                    value: constant.USER.TYPE.BOT,
                },
                { field: 'status', operator: '!=', value: constant.BET.STATUS.WAITING },
                { field: 'created_at', operator: '>=', value: this.helper.getNowTimeStampsSeconds() },
            ],
            async changes => {
                for (const change of changes) {
                    await callBack?.(change);
                }
            },
        );
    }
}
