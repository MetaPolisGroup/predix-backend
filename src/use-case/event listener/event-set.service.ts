import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import constant from 'src/configuration';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { PredictionService } from '../prediction/prediction.service';

@Injectable()
export class EventSetListener implements OnApplicationBootstrap {
  private logger: Logger;

  async onApplicationBootstrap() {
    if (process.env.CONSTANT_ENABLE === 'True') {
      await this.listenSetIntervalSeconds();
      await this.listenSetBufferSeconds();
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
    this.logger = new Logger(EventSetListener.name);
  }

  async listenSetIntervalSeconds() {
    await this.factory.predictionContract.on('NewIntervalSeconds', async (intervalSeconds: bigint) => {
      await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE, {
        interval_seconds: parseInt(intervalSeconds.toString()),
      });
    });
  }

  async listenSetBufferSeconds() {
    await this.factory.predictionContract.on('NewBufferSeconds', async (bufferSeconds: bigint) => {
      await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE, {
        buffer_seconds: parseInt(bufferSeconds.toString()),
      });
    });
  }

  async listenSetFee() {
    await this.factory.predictionContract.on('NewTreasuryFee', async (epoch: bigint, treasuryFee: bigint) => {
      await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE, {
        fee: parseInt(treasuryFee.toString()),
      });
    });
  }

  async listenPause() {
    await this.factory.predictionContract.on('Pause', async (epoch: bigint) => {
      await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE, {
        paused: true,
      });

      // Cancel current rounds
      await this.prediction.cancelCurrentRound();
    });
  }

  async listenUnPause() {
    await this.factory.predictionContract.on('Unpause', async (epoch: bigint) => {
      await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE, {
        paused: false,
        genesis_start: false,
        genesis_lock: false,
      });

      // Genesis start
      await this.prediction.genesisStartRound();
    });
  }
}
