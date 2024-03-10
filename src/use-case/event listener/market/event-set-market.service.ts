import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import constant from 'src/configuration';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { PredictionService } from 'src/use-case/prediction/prediction.service';

@Injectable()
export class EventMarketSetListener implements OnApplicationBootstrap {
  private logger: Logger;

  async onApplicationBootstrap() {
    if (process.env.CONSTANT_ENABLE === 'True') {
      await this.listenSetFee();
      await this.listenPause();
      await this.listenUnPause();
    }
  }

  constructor(
    private readonly factory: ContractFactoryAbstract,
    private readonly db: IDataServices,
    private readonly prediction: PredictionService,
  ) {
    this.logger = new Logger(EventMarketSetListener.name);
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
