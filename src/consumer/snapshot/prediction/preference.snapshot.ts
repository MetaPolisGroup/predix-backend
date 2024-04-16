import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { PredixOperatorContract } from 'src/use-case/contracts/predix/prediction-operator.service';

@Injectable()
export class PreferenceSnapshotService implements OnApplicationBootstrap {
    onApplicationBootstrap() {
        if (process.env.CONSTANT_ENABLE === 'True') {
            // this.genesisSnapshot();
        }
    }

    constructor(
        private readonly db: IDataServices,
        private readonly prediction: PredixOperatorContract,
    ) {}

    // genesisSnapshot() {
    //   this.db.preferenceRepo.listenToChangesWithConditions(
    //     [
    //       {
    //         field: 'genesis_start',
    //         operator: '==',
    //         value: false,
    //       },
    //       {
    //         field: 'genesis_lock',
    //         operator: '==',
    //         value: false,
    //       },
    //     ],

    //     async changes => {
    //       for (const change of changes) {
    //         if (change.type === 'modified') {
    //           await this.prediction.genesisStartRound();
    //         }
    //       }
    //     },
    //   );
    // }
}
