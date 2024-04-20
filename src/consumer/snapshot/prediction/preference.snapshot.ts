import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import constant from 'src/configuration';
import { PredictionSchedulerService } from 'src/consumer/scheduler/predix/prediction-scheduler.service';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { DocumentChange } from 'src/core/abstract/data-services/snapshot/Query.abstract';
import { Preferences } from 'src/core/entity/preferences.entity';
import { PredictionRoundService } from 'src/use-case/games/prediction/prediction-round.service';

@Injectable()
export class PredixPreferenceSnapshot implements OnApplicationBootstrap {
    constructor(
        private readonly db: IDataServices,
        private readonly predixScheduler: PredictionSchedulerService,
        private readonly predixRound: PredictionRoundService,
    ) {}

    onApplicationBootstrap() {
        this.genesisSnapshot(async change => {
            this.predixScheduler.newRoundHandler(await this.predixRound.getCurrentRound());
        });
    }

    genesisSnapshot(cb: (change: DocumentChange<Preferences>) => Promise<void> | void) {
        this.db.preferenceRepo.listenToChangesWithConditions(
            [
                {
                    field: 'paused',
                    operator: '==',
                    value: false,
                },
                {
                    field: 'id',
                    operator: '==',
                    value: constant.FIREBASE.DOCUMENT.PREFERENCE.PREDICTION,
                },
            ],

            async changes => {
                for (const change of changes) {
                    await cb?.(change);
                }
            },
        );
    }
}
