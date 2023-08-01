/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { ethers } from 'ethers';
import constant from 'src/configuration';
import { providerRPC } from 'src/configuration/provider';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';

@Injectable()
export class ChainlinkService {
  private logger: Logger;

  constructor(private readonly factory: ContractFactoryAbstract, private readonly db: IDataServices) {}

  @Cron('*/5 * * * * *')
  async updatePriceFromChainlink() {
    if (process.env.CONSTANT_ENABLE === 'True') {
      const chainlinkPrice = await this.factory.aggregatorContract.latestRoundData();

      if (!chainlinkPrice) {
        this.logger.warn('No chainlink data !');
        return;
      }

      // Implement
      await this.db.chainlinkRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.CHAINLINK, {
        price: chainlinkPrice[1].toString(),
        updated_at: new Date().getTime(),
      });
    }
  }
}
