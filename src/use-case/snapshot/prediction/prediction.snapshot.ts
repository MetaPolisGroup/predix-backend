import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { HelperService } from 'src/use-case/helper/helper.service';
import { PredictionService } from 'src/use-case/prediction/prediction.service';

@Injectable()
export class PredictionSnapshotService implements OnApplicationBootstrap {
  private logger: ILogger;

  onApplicationBootstrap() {

    if (process.env.CONSTANT_ENABLE === 'True') {
      this.availableRoundSnapshot();
    }

    if (process.env.CONSTANT_BOT === 'True') {
      this.automaticBotBetSnapshot();
    }
  }

  constructor(private readonly db: IDataServices,
    private readonly prediction: PredictionService,
    private readonly factory: ContractFactoryAbstract,
    private readonly logFactory: ILoggerFactory) {
    this.logger = this.logFactory.predictionLogger

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

            await this.prediction.setCronjobExecute(change.doc);


          }
        }
      },
    );
  }

  automaticBotBetSnapshot() {
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
            this.prediction.setCronjobAutoBet(change.doc);
          }
        }
      },
    );
  }
}
