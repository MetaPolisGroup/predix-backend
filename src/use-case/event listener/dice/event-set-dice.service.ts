import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import constant from 'src/configuration';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { DiceService } from 'src/use-case/dice/dice.service';
import { PredictionService } from 'src/use-case/prediction/prediction.service';

@Injectable()
export class EventDiceSetListener implements OnApplicationBootstrap {
  private logger: Logger;

  async onApplicationBootstrap() {
    if (process.env.CONSTANT_ENABLE_DICE === 'True') {
      await this.listenSetIntervalSeconds();
      await this.listenSetFee();
      await this.listenPause();
      await this.listenUnPause();
    }
  }

  constructor(private readonly factory: ContractFactoryAbstract, private readonly db: IDataServices, private readonly dice: DiceService) {
    this.logger = new Logger(EventDiceSetListener.name);
  }

  async listenSetIntervalSeconds() {
    await this.factory.diceContract.on('NewIntervalSeconds', async (intervalSeconds: bigint) => {
      await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.DICE, {
        interval_seconds: parseInt(intervalSeconds.toString()),
      });
    });
  }

  async listenSetFee() {
    await this.factory.diceContract.on('NewTreasuryFee', async (epoch: bigint, treasuryFee: bigint) => {
      await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.DICE, {
        fee: parseInt(treasuryFee.toString()),
      });
    });
  }

  async listenPause() {
    await this.factory.diceContract.on('Pause', async (epoch: bigint) => {
      await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.DICE, {
        paused: true,
      });

      // Cancel current rounds
      await this.dice.cancelCurrentRound();
    });
  }

  async listenUnPause() {
    await this.factory.diceContract.on('Unpause', async (epoch: bigint) => {
      await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.DICE, {
        paused: false,
        genesis_start: false,
      });

      // Genesis start
      await this.dice.genesisStartRound();
    });
  }
}
