/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import constant from 'src/configuration';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { Chart } from 'src/core/entity/chart.entity';

@Injectable()
export class ChainlinkTaskService implements OnApplicationBootstrap {
  private logger: Logger;

  async onApplicationBootstrap() {}

  constructor(private readonly factory: ContractFactoryAbstract, private readonly db: IDataServices) {
    this.logger = new Logger(ChainlinkTaskService.name);
  }

  // @Cron('*/5 * * * * *')
  // async updatePriceFromChainlinkChart() {
  //   const chainlinkPrice = await this.factory.aggregatorContract.latestRoundData();

  //   if (!chainlinkPrice) {
  //     this.logger.warn('No chainlink data !');
  //     return;
  //   }

  //   const chart: Chart = {
  //     created_at: parseInt(chainlinkPrice[2].toString()),
  //     delete: false,
  //     price: parseInt(chainlinkPrice[1].toString()),
  //   };

  //   await this.db.chartRepo.upsertDocumentData(parseInt(chainlinkPrice[2].toString()).toString(), chart);
  // }

  // @Cron('*/5 * * * * *')
  // async updatePriceFromChainlink() {
  //   const chainlinkPrice = await this.factory.aggregatorContract.latestRoundData();

  //   if (!chainlinkPrice) {
  //     this.logger.warn('No chainlink data !');
  //     return;
  //   }

  //   // Implement
  //   await this.db.chainlinkRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.CHAINLINK, {
  //     price: chainlinkPrice[1].toString(),
  //     updated_at: new Date().getTime(),
  //   });
  // }
}
