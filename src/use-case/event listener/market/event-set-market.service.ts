import constant from 'src/configuration';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { PredictionService } from 'src/use-case/prediction/prediction.service';

@Injectable()
export class EventMarketSetListener implements OnApplicationBootstrap {
  private logger: ILogger;

  async onApplicationBootstrap() {
    if (process.env.CONSTANT_ENABLE_MARKET === 'True') {
      await this.listenSetFee();
      await this.listenPause();
      await this.listenUnPause();
    }
  }

  constructor(
    private readonly factory: ContractFactoryAbstract,
    private readonly db: IDataServices,
    private readonly prediction: PredictionService,
    private readonly logFactory: ILoggerFactory
  ) {
    this.logger = this.logFactory.marketLogger
  }

  async listenSetFee() {
    await this.factory.marketContract.on('NewTreasuryFee', async (epoch: bigint, treasuryFee: bigint) => {
      await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.MARKET, {
        fee: parseInt(treasuryFee.toString()),
      });
    });
  }

  async listenPause() {
    await this.factory.marketContract.on('Pause', async (epoch: bigint) => {
      await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.MARKET, {
        paused: true,
      });

      // Cancel current rounds
      await this.prediction.cancelCurrentRound();
    });
  }

  async listenUnPause() {
    await this.factory.marketContract.on('Unpause', async (epoch: bigint) => {
      await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.MARKET, {
        paused: false,
        genesis_start: false,
        genesis_lock: false,
      });

      // Genesis start
      // await this.prediction.genesisStartRound();
    });
  }
}
