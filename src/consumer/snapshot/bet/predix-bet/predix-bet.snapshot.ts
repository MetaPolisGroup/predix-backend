import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import constant from 'src/configuration';
import { Position } from 'src/configuration/type';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { DocumentChange } from 'src/core/abstract/data-services/snapshot/Query.abstract';
import { Bet } from 'src/core/entity/bet.entity';
import { UserType } from 'src/core/entity/user.enity';
import { HelperService } from 'src/use-case/helper/helper.service';
import { ManipulationService } from 'src/use-case/manipulation/manipulation.service';
import { PredixStatisticService } from 'src/use-case/statistic/predix/predix-statistic.service';

@Injectable()
export class PredixBetSnapshotService implements OnApplicationBootstrap {
    constructor(
        private readonly db: IDataServices,
        private readonly helper: HelperService,
        private readonly predixStatistic: PredixStatisticService,
        private readonly predixManipulation: ManipulationService,
    ) {}

    onApplicationBootstrap() {
        this.botBetHasResultAndIncludedInVolumeSnapshot(change => {
            this.predixStatistic.calculateCurrentProfitAndUpdate(change.doc);
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
