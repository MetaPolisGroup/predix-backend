/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { ethers } from 'ethers';
import constant from 'src/configuration';
import { providerRPC } from 'src/configuration/provider';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';

@Injectable()
export class ChainlinkService {
  constructor(private readonly factory: ContractFactoryAbstract, private readonly db: IDataServices) {}

  @Cron('*/5 * * * * *')
  async updatePriceFromChainlink() {
    if (constant.ENABLE) {
      const p = new ethers.JsonRpcProvider(providerRPC['bsc'].rpc, {
        chainId: providerRPC['bsc'].chainId,
        name: providerRPC['bsc'].name,
      });
      const aggregatorContract = new ethers.Contract(constant.ADDRESS.AGGREGATOR, constant.ABI.AGGREGATOR, p);

      const d = await aggregatorContract.latestRoundData();

      await this.db.chainlinkRepo.upsertDocumentData('yxyBQpwTC7EyziO7NDia', {
        price: d[1].toString(),
        updated_at: new Date().getTime(),
      });
    }
  }
}
