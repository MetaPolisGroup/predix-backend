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

  @Cron('*/5 * * * * *')
  async updatePriceFromChainlink() {
    if (process.env.CONSTANT_ENABLE === 'True') {
      const p = new ethers.JsonRpcProvider(providerRPC['bsc'].rpc, {
        chainId: providerRPC['bsc'].chainId,
        name: providerRPC['bsc'].name,
      });
      const aggregatorContract = new ethers.Contract(constant.ADDRESS.AGGREGATOR, constant.ABI.AGGREGATOR, p);

      if (aggregatorContract) {
        const d = await aggregatorContract.latestRoundData();
        if (d) {
          const chart: Chart = {
            created_at: parseInt(d[2].toString()),
            // created_at: new Date().getTime() / 1000,
            delete: false,
            price: parseInt(d[1].toString()),
          };

          await this.db.chartRepo.upsertDocumentData(parseInt(d[2].toString()).toString(), chart);
        } else {
          this.logger.warn('No chainlink data !');
        }
      } else {
        this.logger.error('Failed to create Aggregator contract !');
      }
    }
  }
}
