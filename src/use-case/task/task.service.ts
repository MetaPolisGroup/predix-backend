/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ethers } from 'ethers';
import constant from 'src/configuration';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { Chart } from 'src/core/entity/chart.entity';

@Injectable()
export class TaskService implements OnApplicationBootstrap {
  private logger: Logger;

  async onApplicationBootstrap() {}

  constructor(private readonly factory: ContractFactoryAbstract, private readonly db: IDataServices) {}

  // @Cron('* */5 * * * *')
  // async executeRound() {
  //   const priceRandom = [24399280000, 24400000000, 24397541869, 24397644724, 24394974000, 24394703900, 24394904985];

  //   const randomElement = priceRandom[Math.floor(Math.random() * priceRandom.length)];

  //   const wallet = new ethers.Wallet(process.env.OWNER_ADDRESS_PRIVATEKEY, constant.PROVIDER);

  //   const predictionContract = new ethers.Contract(constant.ADDRESS.PREDICTION, constant.ABI.PREDICTION, wallet);

  //   const gasLimit = await predictionContract.executeRound.estimateGas(randomElement);
  //   const gasPrice = await constant.PROVIDER.getFeeData();

  //   console.log({ gasLimit });

  //   console.log({ gasPrice });
  //   await predictionContract.executeRound(100, 1000, {
  //     gasLimit,
  //     gasPrice,
  //   });

  //   console.log('Cron');
  // }

  @Cron('*/5 * * * * *')
  async updatePriceFromChainlinkChart() {
    if (process.env.CONSTANT_ENABLE === 'True') {
      const chainlinkPrice = await this.factory.aggregatorContract.latestRoundData();

      if (!chainlinkPrice) {
        this.logger.warn('No chainlink data !');
        return;
      }

      const chart: Chart = {
        created_at: parseInt(chainlinkPrice[2].toString()),
        delete: false,
        price: parseInt(chainlinkPrice[1].toString()),
      };

      await this.db.chartRepo.upsertDocumentData(parseInt(chainlinkPrice[2].toString()).toString(), chart);
    }
  }

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
