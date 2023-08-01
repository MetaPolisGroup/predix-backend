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
import { Prediction } from 'src/core/entity/prediction.enity';

@Injectable()
export class PredictionService implements OnApplicationBootstrap {
  private cronJobs: { [id: string]: CronJob } = {};

  private logger: Logger;

  async onApplicationBootstrap() {
    if (process.env.CONSTANT_ENABLE === 'True') {
      await this.updateContractState();
    }
  }

  constructor(private readonly factory: ContractFactoryAbstract, private readonly db: IDataServices) {
    this.logger = new Logger(PredictionService.name);
  }

  private createCronJob(date: Date, id: number, cb?: () => Promise<void>): void {
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

  async setCronjob(availableRound: Prediction) {
    // Consts

    const now = parseInt((new Date().getTime() / 1000).toString());
    const preferences = await this.db.preferenceRepo.getFirstValueCollectionData();

    // Log
    if (!preferences) {
      this.logger.error(`Preferences not found when set cronjob`);
      return;
    }

    if (this.cronJobs[availableRound?.epoch]) {
      this.logger.log(`Cronjob for round ${availableRound.epoch} have already set !`);
      return;
    }

    if (!availableRound) {
      this.logger.warn(`No available round to set cronjob !`);
      return;
    }

    //
    if (!preferences.genesis_start && !preferences.genesis_lock) {
      this.logger.warn(`Only execute round after Genesis Start and Genesis Lock`);
      return;
    }

    //
    if (preferences.genesis_start && !preferences.genesis_lock) {
      const date = new Date((availableRound.startTimestamp + preferences.interval_seconds) * 1000);
      this.createCronJob(date, availableRound.epoch, async () => {
        await this.genesisLockRound();
      });
    }

    // Log error when round locktime exceed buffer time
    if (availableRound.lockTimestamp + preferences.buffer_seconds < now) {
      this.logger.error('Round exceed buffer time !');
      await this.setCronjob(availableRound);
    }

    //
    else {
      // Execute round immediately if lock time is up
      if (availableRound.startTimestamp + preferences.interval_seconds < now) {
        await this.executeRound();
      }

      // Set cronjob to execute round  after interval time
      else {
        const date = new Date((availableRound.startTimestamp + preferences.interval_seconds) * 1000);
        this.createCronJob(date, availableRound.epoch, async () => {
          await this.executeRound();
        });
      }
    }
  }

  async executeRound() {
    const chainLinkPrice = await this.factory.aggregatorContract.latestRoundData();

    if (!chainLinkPrice) {
      this.logger.warn('No chainlink data !');
      return;
    }

    // Implement
    const gasLimit = await this.factory.predictionAdminContract.executeRound.estimateGas(chainLinkPrice[0], chainLinkPrice[1]);
    const gasPrice = await this.factory.provider.getFeeData();

    const executeRoundTx = await this.factory.predictionAdminContract.executeRound(chainLinkPrice[0], chainLinkPrice[1], {
      gasLimit,
      gasPrice: gasPrice.gasPrice,
      maxFeePerGas: gasPrice.maxFeePerGas,
      maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
    });

    const executeRound = await this.factory.provider.waitForTransaction(executeRoundTx.hash as string);

    // Execute round success
    if (executeRound.status === 1) {
      this.logger.log(`New round execute successfully!`);
    }

    // Execute round failed
    else {
      this.logger.log(`New round executed failed! retry...`);
      await this.executeRound();
    }
  }

  async updateContractState() {
    const preference = await this.db.preferenceRepo.getFirstValueCollectionData();

    if (!preference) {
      this.logger.error('Preference not found when update contract state !');
      return;
    }

    const genesisStart = await this.factory.predictionContract.genesisStartOnce();

    const genesisLock = await this.factory.predictionContract.genesisLockOnce();

    const bufferSeconds = await this.factory.predictionContract.bufferSeconds();

    const intervalSeconds = await this.factory.predictionContract.intervalSeconds();

    if (genesisStart) {
      preference.genesis_start = genesisStart;
    }

    if (genesisLock) {
      preference.genesis_lock = genesisLock;
    }

    if (bufferSeconds) {
      preference.buffer_seconds = parseInt(bufferSeconds.toString());
    }

    if (intervalSeconds) {
      preference.interval_seconds = parseInt(intervalSeconds.toString());
    }

    await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE, preference);

    if (!genesisStart) {
      this.logger.warn("Can't get Genesis Start from contract !");
    }

    if (!genesisLock) {
      this.logger.warn("Can't get Genesis Lock from contract !");
    }

    if (!bufferSeconds) {
      this.logger.warn("Can't get Buffer seconds from contract !");
    }

    if (!intervalSeconds) {
      this.logger.warn("Can't get Interval seconds from contract !");
    }
  }

  async genesisStartRound() {
    // Implement
    const gasLimit = await this.factory.predictionAdminContract.genesisStartRound.estimateGas();
    const gasPrice = await this.factory.provider.getFeeData();

    const genesisStartRound = await this.factory.predictionAdminContract.genesisStartRound({
      gasLimit,
      gasPrice: gasPrice.gasPrice,
      maxFeePerGas: gasPrice.maxFeePerGas,
      maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
    });

    const genesisStartRoundTx = await this.factory.provider.waitForTransaction(genesisStartRound.hash as string);

    // Execute round success
    if (genesisStartRoundTx.status === 1) {
      this.logger.log(`Genesis start round successfully!`);

      // Update genesis start preference

      await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE, {
        genesis_start: true,
      });
    }

    // Execute round failed
    else {
      this.logger.log(`Genesis start failed! retry...`);
      await this.genesisStartRound();
    }
  }

  async genesisLockRound() {
    const chainLinkPrice = await this.factory.aggregatorContract.latestRoundData();

    if (!chainLinkPrice) {
      this.logger.warn('No chainlink data !');
      return;
    }

    // Implement
    const gasLimit = await this.factory.predictionAdminContract.genesisLockRound.estimateGas(chainLinkPrice[0], chainLinkPrice[1]);
    const gasPrice = await this.factory.provider.getFeeData();

    const genesisLockRound = await this.factory.predictionAdminContract.genesisLockRound(chainLinkPrice[0], chainLinkPrice[1], {
      gasLimit,
      gasPrice: gasPrice.gasPrice,
      maxFeePerGas: gasPrice.maxFeePerGas,
      maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
    });

    const genesisLockRoundTx = await this.factory.provider.waitForTransaction(genesisLockRound.hash as string);

    // Execute round success
    if (genesisLockRoundTx.status === 1) {
      this.logger.log(`New round execute successfully!`);

      // Update genesis lock preference
      await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE, {
        genesis_lock: true,
      });
    }

    // Execute round failed
    else {
      this.logger.log(`New round executed failed! retry...`);
      await this.genesisLockRound();
    }
  }

  async cancelCurrentRound() {
    const currentRounds = await this.db.predictionRepo.getCollectionDataByConditions([
      {
        field: 'locked',
        operator: '==',
        value: false,
      },
      {
        field: 'cancel',
        operator: '==',
        value: false,
      },
    ]);

    if (currentRounds) {
      for (const round of currentRounds) {
        await this.db.predictionRepo.upsertDocumentData(round.epoch.toString(), {
          cancel: true,
        });
      }
    }
  }
}
