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
      const p = new ethers.JsonRpcProvider(providerRPC['bsc'].rpc, {
        chainId: providerRPC['bsc'].chainId,
        name: providerRPC['bsc'].name,
      });
      const aggregatorContract = new ethers.Contract(constant.ADDRESS.AGGREGATOR, constant.ABI.AGGREGATOR, p);

      if (aggregatorContract) {
        const d = await aggregatorContract.latestRoundData();
        if (d) {
          await this.db.chainlinkRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.CHAINLINK, {
            price: d[1].toString(),
            updated_at: new Date().getTime(),
          });
        } else {
          this.logger.warn('No chainlink data !');
        }
      } else {
        this.logger.error('Failed to create Aggregator contract !');
      }
    }
  }
}
