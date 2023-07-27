/* eslint-disable @typescript-eslint/no-unsafe-argument */
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
export class PredictionService implements OnApplicationBootstrap {
  private cronJobs: { [id: string]: CronJob } = {};

  private logger: Logger;

  async onApplicationBootstrap() {
    if (process.env.CONSTANT_ENABLE === 'True') {
      await this.setCronjob();
    }
  }

  constructor(private readonly factory: ContractFactoryAbstract, private readonly db: IDataServices) {
    this.logger = new Logger(PredictionService.name);
  }

  createCronJob(date: Date, id: number, cb?: () => Promise<void>): void {
    const cronjob = new CronJob(date, async function () {
      await cb?.();
    });

    if (this.cronJobs[id] && this.cronJobs[id].running) {
      this.logger.log(`Cronjob for round ${id} have already set !`);
      return;
    }

    this.cronJobs[id] = cronjob;

    cronjob.start();

    this.logger.log(`Cronjob for round ${id} have been set !`);
  }

  async setCronjob() {
    const availableRound = await this.db.predictionRepo.getFirstValueCollectionDataByConditionsAndOrderBy(
      [
        {
          field: 'locked',
          operator: '==',
          value: false,
        },
      ],
      [
        {
          field: 'epoch',
          option: 'desc',
        },
      ],
    );
    const now = parseInt((new Date().getTime() / 1000).toString());
    const preferences = await this.db.preferenceRepo.getFirstValueCollectionData();

    if (!preferences) {
      this.logger.error(`Preferences not found when set cronjob`);
    }

    if (availableRound && !this.cronJobs[availableRound.epoch] && preferences) {
      if (availableRound.lockTimestamp + preferences.buffer_seconds < now) {
        this.logger.error('Round exceed buffer time !');
        await this.setCronjob();
      } else {
        if (availableRound.startTimestamp + preferences.interval_seconds < now) {
          await this.executeRound();
        } else {
          const date = new Date((availableRound.startTimestamp + preferences.interval_seconds) * 1000);
          this.createCronJob(date, availableRound.epoch, async () => {
            await this.executeRound();
          });
        }
      }
    }
  }

  @Cron('*/30 * * * * *')
  async setCronjobAutomatically() {
    if (process.env.CONSTANT_ENABLE === 'True') {
      await this.setCronjob();
    }
  }

  async executeRound() {
    const p = new ethers.JsonRpcProvider(providerRPC['bsc'].rpc, {
      chainId: providerRPC['bsc'].chainId,
      name: providerRPC['bsc'].name,
    });
    const aggregatorContract = new ethers.Contract(constant.ADDRESS.AGGREGATOR, constant.ABI.AGGREGATOR, p);

    const chainLinkPrice = await aggregatorContract.latestRoundData();

    const wallet = new ethers.Wallet(process.env.OWNER_ADDRESS_PRIVATEKEY, constant.PROVIDER);

    const predictionContract = new ethers.Contract(constant.ADDRESS.PREDICTION, constant.ABI.PREDICTION, wallet);

    if (chainLinkPrice && predictionContract) {
      const gasLimit = await predictionContract.executeRound.estimateGas(chainLinkPrice[0], chainLinkPrice[1]);
      const gasPrice = await constant.PROVIDER.getFeeData();

      const executeRoundTx = await predictionContract.executeRound(chainLinkPrice[0], chainLinkPrice[1], {
        gasLimit,
        gasPrice: gasPrice.gasPrice,
        maxFeePerGas: gasPrice.maxFeePerGas,
        maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
      });

      const executeRound = await constant.PROVIDER.waitForTransaction(executeRoundTx.hash as string);
      if (executeRound.status === 1) {
        this.logger.log(`New round execute successfully!`);
      } else {
        this.logger.log(`New round executed failed! retry...`);
        await this.executeRound();
      }
    }
  }
}
