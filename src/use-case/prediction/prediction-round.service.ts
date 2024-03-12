/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { CronJob } from 'cron';
import constant from 'src/configuration';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { Prediction } from 'src/core/entity/prediction.enity';

@Injectable()
export class PredictionRoundService implements OnApplicationBootstrap {
  private logger: ILogger;

  async onApplicationBootstrap() {
    if (process.env.CONSTANT_ENABLE === 'True') {
      await this.updateCurrentRound();
      await this.validateRoundInDb();
    }
  }

  constructor(private readonly db: IDataServices,
    private readonly factory: ContractFactoryAbstract,
    private readonly logFactory: ILoggerFactory
  ) {
    this.logger = this.logFactory.predictionLogger
  }

  async createNewRound(epoch: bigint) {
    const preferences = await this.db.preferenceRepo.getDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.PREDICTION);
    const now = Math.round(new Date().getTime() / 1000);

    if (!preferences) {
      this.logger.error(`Preferences not found !`);
      return;
    }

    // Create round variable
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

  }

  async updateLockRound(epoch: bigint, roundId: bigint, price: bigint) {
    let round: Prediction = null;

    round = await this.db.predictionRepo.getFirstValueCollectionDataByConditions([
      {
        field: 'epoch',
        operator: '==',
        value: parseInt(epoch.toString()),
      },
    ]);

    if (!round) {
      round = await this.getRoundFromChain(epoch);
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

  async getRoundFromChain(epoch: bigint): Promise<Prediction> {
    const roundFromChain = await this.factory.predictionContract.rounds(epoch);
    const now = new Date().getTime() / 1000;
    const currentEpoch = await this.factory.predictionContract.currentEpoch();
    const preferences = await this.db.preferenceRepo.getFirstValueCollectionData();
    const round: Prediction = {
      epoch: +roundFromChain[0].toString(),
      startTimestamp: +roundFromChain[1].toString(),
      lockTimestamp: +roundFromChain[2].toString(),
      closeTimestamp: +roundFromChain[3].toString(),
      lockPrice: +roundFromChain[4].toString(),
      closePrice: +roundFromChain[5].toString(),
      lockOracleId: +roundFromChain[6].toString(),
      closeOracleId: +roundFromChain[7].toString(),
      totalAmount: +roundFromChain[8].toString(),
      bullAmount: +roundFromChain[9].toString(),
      bearAmount: +roundFromChain[10].toString(),
      locked: +roundFromChain[6].toString() !== 0 && +roundFromChain[2].toString() < now,
      closed: +roundFromChain[7].toString() !== 0 && +roundFromChain[3].toString() < now,
      delele: false,
      cancel: false,
    };

    round.cancel = (round.closed && round.totalAmount <= 0) || (!round.locked && currentEpoch > round.epoch);

    return round;
  }

  async updateCurrentRound() {
    const currentEpoch: bigint = await this.factory.predictionContract.currentEpoch();

    // Update Current round
    if (currentEpoch > 0) {
      const currentRound = await this.getRoundFromChain(currentEpoch);
      await this.db.predictionRepo.upsertDocumentData(currentRound.epoch.toString(), currentRound);
    }

    if (currentEpoch > 1) {
      // Update Live round
      const liveRound = await this.getRoundFromChain(BigInt(+currentEpoch.toString() - 1));
      await this.db.predictionRepo.upsertDocumentData(liveRound.epoch.toString(), liveRound);
    }

    if (currentEpoch > 2) {
      const expiredRound = await this.getRoundFromChain(BigInt(+currentEpoch.toString() - 2));
      await this.db.predictionRepo.upsertDocumentData(expiredRound.epoch.toString(), expiredRound);
    }
  }

  async validateRoundInDb() {
    const rounds = await this.db.predictionRepo.getCollectionDataByConditions([
      {
        field: 'cancel',
        operator: '==',
        value: false,
      },
    ]);

    if (rounds) {
      for (const r of rounds) {
        const round = await this.getRoundFromChain(BigInt(r.epoch));
        await this.db.predictionRepo.upsertDocumentData(round.epoch.toString(), round);
      }
    }
  }
}
