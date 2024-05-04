import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import constant from 'src/configuration';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { DocumentChange } from 'src/core/abstract/data-services/snapshot/Query.abstract';
import { Preferences } from 'src/core/entity/preferences.entity';
import { PredictionSnapshotService } from './prediction.snapshot';
import { PredictionRoundService } from 'src/use-case/games/prediction/prediction-round.service';

@Injectable()
export class PredixPreferenceSnapshot implements OnApplicationBootstrap {
    constructor(
        private readonly db: IDataServices,
        private readonly predixSnapshot: PredictionSnapshotService,
        private readonly predixRound: PredictionRoundService,
    ) {}

    async onApplicationBootstrap() {
        await this.predixRound.updateState();
        // let predixUnsub: () => void;
        // this.unpauseSnapshot(() => {
        //     predixUnsub = this.predixSnapshot.predixSnapshot();
        // });
        // this.pauseSnapshot(() => {
        //     predixUnsub?.();
        //     predixUnsub = null;
        // });
    }

    unpauseSnapshot(cb: (change: DocumentChange<Preferences>) => Promise<void> | void) {
        this.db.preferenceRepo.listenToChangesWithConditions(
            [
                {
                    field: 'manual_paused',
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

    pauseSnapshot(cb: (change: DocumentChange<Preferences>) => Promise<void> | void) {
        this.db.preferenceRepo.listenToChangesWithConditions(
            [
                {
                    field: 'manual_paused',
                    operator: '==',
                    value: true,
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
