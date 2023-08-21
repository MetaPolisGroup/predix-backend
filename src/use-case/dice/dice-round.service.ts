/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import constant from 'src/configuration';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { Dice } from 'src/core/entity/dice.entity';

@Injectable()
export class DiceRoundService implements OnApplicationBootstrap {
  private logger: Logger;

  async onApplicationBootstrap() {}

  constructor(private readonly db: IDataServices) {
    this.logger = new Logger(DiceRoundService.name);
  }

  async createNewRound(epoch: bigint) {
    const preferences = await this.db.preferenceRepo.getDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.PREDICTION);
    const now = Math.round(new Date().getTime() / 1000);

    if (!preferences) {
      this.logger.error(`Preferences not found !`);
      return;
    }

    // Update round
    const round: Dice = {
      epoch: parseInt(epoch.toString()),
      bearAmount: 0,
      bullAmount: 0,
      totalAmount: 0,
      dice1: 0,
      dice2: 0,
      dice3: 0,
      sum: 0,
      startTimestamp: now,
      closeTimestamp: now + preferences.interval_seconds,
      closed: false,
      cancel: false,
      delele: false,
    };
    await this.db.diceRepo.upsertDocumentData(epoch.toString(), round);

    // Log
    this.logger.log(`Dice round ${epoch.toString()} has started !`);
  }

  async updateEndRound(epoch: bigint, dice1: bigint, dice2: bigint, dice3: bigint) {
    const round = await this.db.diceRepo.getFirstValueCollectionDataByConditions([
      {
        field: 'epoch',
        operator: '==',
        value: parseInt(epoch.toString()),
      },
    ]);

    if (!round) {
      this.logger.error(`Round ${epoch.toString()} not found from DB when ended on chain !`);
      return;
    }
    //
    const d1 = parseInt(dice1.toString());
    const d2 = parseInt(dice2.toString());
    const d3 = parseInt(dice3.toString());

    // Update round
    round.closeTimestamp = Math.round(new Date().getTime() / 1000);
    round.dice1 = d1;
    round.dice2 = d2;
    round.dice3 = d3;
    round.sum = d1 + d2 + d3;
    round.closed = true;
    round.cancel = round.totalAmount <= 0;

    await this.db.diceRepo.upsertDocumentData(round.epoch.toString(), round);
  }
}
