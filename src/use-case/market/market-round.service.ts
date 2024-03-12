/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { Market } from 'src/core/entity/market.entity';

@Injectable()
export class MarketRoundService implements OnApplicationBootstrap {
  private logger: ILogger;

  async onApplicationBootstrap() { }

  constructor(private readonly db: IDataServices, private readonly logFactory: ILoggerFactory) {
    this.logger = this.logFactory.marketLogger
  }

  async createNewRound(epoch: bigint) {
    const now = Math.round(new Date().getTime() / 1000);

    // Update round
    const game: Market = {
      epoch: parseInt(epoch.toString()),
      result: 'Waiting',
      bearAmount: 0,
      bullAmount: 0,
      totalAmount: 0,
      startTimestamp: now,
      closeTimestamp: null,
      closed: false,
      cancel: false,
      delele: false,
    };
    await this.db.marketRepo.upsertDocumentData(epoch.toString(), game);

  }

  async updateEndRound(epoch: bigint, result: bigint) {
    const round = await this.db.marketRepo.getFirstValueCollectionDataByConditions([
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

    round.closeTimestamp = Math.round(new Date().getTime() / 1000);
    round.closed = true;
    round.cancel = round.totalAmount <= 0;
    round.result = result.toString() === '1' ? 'Up' : 'Down ';

    await this.db.marketRepo.upsertDocumentData(round.epoch.toString(), round);
  }
}
