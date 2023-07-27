/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ethers } from 'ethers';
import constant from 'src/configuration';
import { providerRPC } from 'src/configuration/provider';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { Chart } from 'src/core/entity/chart.entity';

@Injectable()
export class ChartService implements OnApplicationBootstrap {
  async onApplicationBootstrap() {}

  constructor(private readonly factory: ContractFactoryAbstract, private readonly db: IDataServices) {}

  @Cron('*/20 * * * * *')
  async updatePriceFromChainlink() {
    if (process.env.CONSTANT_ENABLE === 'True') {
      const p = new ethers.JsonRpcProvider(providerRPC['bsc'].rpc, {
        chainId: providerRPC['bsc'].chainId,
        name: providerRPC['bsc'].name,
      });
      const aggregatorContract = new ethers.Contract(constant.ADDRESS.AGGREGATOR, constant.ABI.AGGREGATOR, p);

      const d = await aggregatorContract.latestRoundData();

      if (d) {
        const chart: Chart = {
          created_at: parseInt(d[2].toString()),
          delete: false,
          price: parseInt(d[1].toString()),
        };

        await this.db.chartRepo.createDocumentData(chart);
      }
    }
  }
}
