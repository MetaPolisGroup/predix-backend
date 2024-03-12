/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import constant from 'src/configuration';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { Dice } from 'src/core/entity/dice.entity';

@Injectable()
export class DiceRoundService implements OnApplicationBootstrap {
  logger: ILogger

  async onApplicationBootstrap() {
    if (process.env.CONSTANT_ENABLE_DICE === 'True') {
      await this.updateCurrentRound();
      await this.validateRoundInDb();
    }
  }

  constructor(private readonly db: IDataServices, private readonly factory: ContractFactoryAbstract, private readonly logFactory: ILoggerFactory) {
    this.logger = this.logFactory.diceLogger
  }

  async createNewRound(epoch: bigint) {
    const preferences = await this.db.preferenceRepo.getDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.DICE);
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

  async getRoundFromChain(epoch: bigint): Promise<Dice> {
    const roundFromChain = await this.factory.diceContract.rounds(epoch);
    const now = new Date().getTime() / 1000;
    const currentEpoch = await this.factory.diceContract.currentEpoch();
    const round: Dice = {
      epoch: +roundFromChain[0].toString(),
      startTimestamp: +roundFromChain[1].toString(),
      closeTimestamp: +roundFromChain[2].toString(),
      dice1: +roundFromChain[3].toString(),
      dice2: +roundFromChain[4].toString(),
      dice3: +roundFromChain[5].toString(),
      sum: +roundFromChain[6].toString(),
      totalAmount: +roundFromChain[7].toString(),
      bullAmount: +roundFromChain[8].toString(),
      bearAmount: +roundFromChain[9].toString(),
      closed: roundFromChain[10],
      delele: false,
      cancel: false,
    };

    round.cancel = (round.closed && round.totalAmount <= 0) || (!round.closed && round.epoch < currentEpoch);

    return round;
  }

  async updateCurrentRound() {
    const currentEpoch = await this.factory.diceContract.currentEpoch();

    // Update Current round
    if (currentEpoch <= 0) {
      return;
    }
    const currentRound = await this.getRoundFromChain(currentEpoch);
    await this.db.diceRepo.upsertDocumentData(currentRound.epoch.toString(), currentRound);

    if (currentEpoch > 1) {
      // Update Live round
      const liveRound = await this.getRoundFromChain(BigInt(+currentEpoch.toString() - 1));
      await this.db.diceRepo.upsertDocumentData(liveRound.epoch.toString(), liveRound);
    }
  }

  async validateRoundInDb() {
    const rounds = await this.db.diceRepo.getCollectionDataByConditions([
      {
        field: 'cancel',
        operator: '==',
        value: false,
      },
    ]);

    if (rounds) {
      for (const r of rounds) {
        const round = await this.getRoundFromChain(BigInt(r.epoch));
        await this.db.diceRepo.upsertDocumentData(round.epoch.toString(), round);
      }
    }
  }
}
