/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { CronJob } from 'cron';
import constant from 'src/configuration';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { Preferences } from 'src/core/entity/preferences.entity';

@Injectable()
export class MarketService implements OnApplicationBootstrap {
  private logger: ILogger;

  async onApplicationBootstrap() {
    if (process.env.CONSTANT_ENABLE_MARKET === 'True') {
      await this.updateContractState();
    }
  }

  constructor(private readonly factory: ContractFactoryAbstract, private readonly db: IDataServices, private readonly logFactory: ILoggerFactory) {
    this.logger = this.logFactory.marketLogger
  }

  async updateContractState() {
    const preference: Preferences = {
      fee: null,
      paused: null,
    };

    const treasuryFee = await this.factory.marketContract.treasuryFee();

    const paused = await this.factory.marketContract.paused();

    if (treasuryFee !== undefined) {
      preference.fee = parseInt(treasuryFee.toString());
    }

    if (treasuryFee !== undefined) {
      preference.paused = paused;
    }

    await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.MARKET, preference);

    if (!treasuryFee) {
      this.logger.warn("Can't get Fee from contract !");
    }

    if (paused === undefined) {
      this.logger.warn("Can't get Paused from contract !");
    }
  }
}
