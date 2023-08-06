import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { PredictionService } from 'src/use-case/prediction/prediction.service';

@Injectable()
export class PredictionSnapshotService implements OnApplicationBootstrap {
  private logger: Logger;

  onApplicationBootstrap() {
    if (process.env.CONSTANT_ENABLE === 'True') {
      // this.availableRoundSnapshot();
    }
  }

  constructor(private readonly db: IDataServices, private readonly prediction: PredictionService) {
    this.logger = new Logger(PredictionSnapshotService.name);
  }

  availableRoundSnapshot() {
    this.db.predictionRepo.listenToChangesWithConditionsAndOrderBy(
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
          if (change.type === 'added') {
            await this.prediction.setCronjob(change.doc);
          }
        }
      },
    );
  }
}
