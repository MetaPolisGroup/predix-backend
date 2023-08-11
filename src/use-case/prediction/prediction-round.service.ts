/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { CronJob } from 'cron';
import constant from 'src/configuration';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { Prediction } from 'src/core/entity/prediction.enity';

@Injectable()
export class PredictionRoundService implements OnApplicationBootstrap {
  private cronJobs: { [id: string]: CronJob } = {};

  private logger: Logger;

  async onApplicationBootstrap() {}

  constructor(private readonly db: IDataServices) {
    this.logger = new Logger(PredictionRoundService.name);
  }

  async createNewRound(epoch: bigint) {
    const preferences = await this.db.preferenceRepo.getDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.PREDICTION);
    const now = Math.round(new Date().getTime() / 1000);

    if (!preferences) {
      this.logger.error(`Preferences not found !`);
      return;
    }

    // Update round
    const round: Prediction = {
      epoch: parseInt(epoch.toString()),
      closeOracleId: 0,
      lockOracleId: 0,
      bearAmount: 0,
      bullAmount: 0,
      totalAmount: 0,
      closePrice: 0,
      lockPrice: 0,
      startTimestamp: now,
      closeTimestamp: now + preferences.interval_seconds * 2,
      lockTimestamp: now + preferences.interval_seconds,
      closed: false,
      locked: false,
      cancel: false,
      delele: false,
    };
    await this.db.predictionRepo.upsertDocumentData(epoch.toString(), round);

    // Log
    this.logger.log(`Round ${epoch.toString()} has started !`);
  }

  async updateLockRound(epoch: bigint, roundId: bigint, price: bigint) {
    const round = await this.db.predictionRepo.getFirstValueCollectionDataByConditions([
      {
        field: 'epoch',
        operator: '==',
        value: parseInt(epoch.toString()),
      },
    ]);

    if (!round) {
      this.logger.error(`Round ${epoch.toString()} not found from DB when locked on chain !`);
      return;
    }

    // Update round

    round.lockOracleId = parseInt(roundId.toString());
    round.lockPrice = parseInt(price.toString());
    round.lockTimestamp = Math.round(new Date().getTime() / 1000);
    round.locked = true;

    await this.db.predictionRepo.upsertDocumentData(round.epoch.toString(), round);
  }

  async updateEndRound(epoch: bigint, roundId: bigint, price: bigint) {
    const round = await this.db.predictionRepo.getFirstValueCollectionDataByConditions([
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

    // Update round
    round.closeOracleId = parseInt(roundId.toString());
    round.closePrice = parseInt(price.toString());
    round.closeTimestamp = Math.round(new Date().getTime() / 1000);
    round.closed = true;
    round.cancel = round.totalAmount <= 0;

    await this.db.predictionRepo.upsertDocumentData(round.epoch.toString(), round);
  }
}
