/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ethers } from 'ethers';
import constant from 'src/configuration';
import { providerRPC } from 'src/configuration/provider';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { Chart } from 'src/core/entity/chart.entity';

@Injectable()
export class ChartService implements OnApplicationBootstrap {
  private logger: Logger;

  async onApplicationBootstrap() {}

  constructor(private readonly factory: ContractFactoryAbstract, private readonly db: IDataServices) {}

  // @Cron('*/5 * * * * *')
  // async updatePriceFromChainlink() {
  //   if (process.env.CONSTANT_ENABLE === 'True') {
  //     const chainlinkPrice = await this.factory.aggregatorContract.latestRoundData();

  //     if (!chainlinkPrice) {
  //       this.logger.warn('No chainlink data !');
  //       return;
  //     }

  //     const chart: Chart = {
  //       created_at: parseInt(chainlinkPrice[2].toString()),
  //       delete: false,
  //       price: parseInt(chainlinkPrice[1].toString()),
  //     };

  //     await this.db.chartRepo.upsertDocumentData(parseInt(chainlinkPrice[2].toString()).toString(), chart);
  //   }
  // }
}
