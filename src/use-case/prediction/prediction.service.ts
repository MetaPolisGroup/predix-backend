/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { CronJob } from 'cron';
import constant from 'src/configuration';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { Prediction } from 'src/core/entity/prediction.enity';
import { Preferences } from 'src/core/entity/preferences.entity';

@Injectable()
export class PredictionService implements OnApplicationBootstrap {
  private cronJobs: { [id: string]: CronJob } = {};

  private cronJobsBet: { [id: string]: CronJob } = {};

  private logger: Logger;

  async onApplicationBootstrap() {
    if (process.env.CONSTANT_ENABLE === 'True') {
      await this.updateContractState();
    }
  }

  constructor(private readonly factory: ContractFactoryAbstract, private readonly db: IDataServices) {
    this.logger = new Logger(PredictionService.name);
  }

  private createCronJob(cj: { [id: string]: CronJob }, date: Date, id: number, cb?: () => Promise<void>): void {
    const cronjob = new CronJob(date, async function () {
      await cb?.();
    });

    if (cj[id] && cj[id].running) {
      this.logger.log(`Cronjob for round ${id} have already set !`);
      return;
    }

    cj[id] = cronjob;

    cronjob.start();

    this.logger.log(`Cronjob for round ${id} have been set !`);
  }

  async setCronjobExecute(availableRound: Prediction) {
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
      this.createCronJob(this.cronJobs, date, availableRound.epoch, async () => {
        await this.genesisLockRound();
      });
    }

    // Log error when round locktime exceed buffer time
    if (availableRound.lockTimestamp + preferences.buffer_seconds < now) {
      this.logger.error('Round exceed buffer time !');
      // await this.setCronjob(availableRound);
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
        this.createCronJob(this.cronJobs, date, availableRound.epoch, async () => {
          await this.executeRound();
        });
      }
    }
  }

  setCronjobAutoBet(availableRound: Prediction) {
    if (this.cronJobsBet[availableRound?.epoch]) {
      this.logger.log(`Cronjob bet for round ${availableRound.epoch} have already set !`);
      return;
    }

    if (!availableRound) {
      this.logger.warn(`No available round to set cronjob bet!`);
      return;
    }

    const date = new Date((availableRound.lockTimestamp - 20) * 1000);
    this.createCronJob(this.cronJobsBet, date, availableRound.epoch, async () => {
      await this.automaticBotBet(2000);
    });
  }

  async executeRound() {
    const chainLinkPrice = await this.factory.aggregatorContract.latestRoundData();

    if (!chainLinkPrice) {
      this.logger.warn('No chainlink data !');
      return;
    }

    // Implement
    const gasLimit = await this.factory.predictionContract.executeRound.estimateGas(chainLinkPrice[0], chainLinkPrice[1]);
    const gasPrice = await this.factory.provider.getFeeData();

    const executeRoundTx = await this.factory.predictionContract.executeRound(chainLinkPrice[0], chainLinkPrice[1], {
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
    const preference: Preferences = {
      buffer_seconds: null,
      fee: null,
      genesis_lock: null,
      genesis_start: null,
      interval_seconds: null,
      paused: null,
    };

    if (!preference) {
      this.logger.warn('Preference not found when update state contract !');
      return;
    }

    const genesisStart = await this.factory.predictionContract.genesisStartOnce();

    const genesisLock = await this.factory.predictionContract.genesisLockOnce();

    const bufferSeconds = await this.factory.predictionContract.bufferSeconds();

    const intervalSeconds = await this.factory.predictionContract.intervalSeconds();

    const treasuryFee = await this.factory.predictionContract.treasuryFee();

    if (genesisStart !== undefined) {
      preference.genesis_start = genesisStart;
    }

    if (genesisLock !== undefined) {
      preference.genesis_lock = genesisLock;
    }

    if (bufferSeconds !== undefined) {
      preference.buffer_seconds = parseInt(bufferSeconds.toString());
    }

    if (intervalSeconds !== undefined) {
      preference.interval_seconds = parseInt(intervalSeconds.toString());
    }

    if (treasuryFee !== undefined) {
      preference.fee = parseInt(treasuryFee.toString());
    }

    await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.PREDICTION, preference);

    if (genesisStart === undefined) {
      this.logger.warn("Can't get Genesis Start from contract !");
    }

    if (genesisLock === undefined) {
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
    const gasLimit = await this.factory.predictionContract.genesisStartRound.estimateGas();
    const gasPrice = await this.factory.provider.getFeeData();

    const genesisStartRound = await this.factory.predictionContract.genesisStartRound({
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

      await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.PREDICTION, {
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
    const gasLimit = await this.factory.predictionContract.genesisLockRound.estimateGas(chainLinkPrice[0], chainLinkPrice[1]);
    const gasPrice = await this.factory.provider.getFeeData();

    const genesisLockRound = await this.factory.predictionContract.genesisLockRound(chainLinkPrice[0], chainLinkPrice[1], {
      gasLimit,
      gasPrice: gasPrice.gasPrice,
      maxFeePerGas: gasPrice.maxFeePerGas,
      maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
    });

    const genesisLockRoundTx = await this.factory.provider.waitForTransaction(genesisLockRound.hash as string);

    // Execute round success
    if (genesisLockRoundTx.status === 1) {
      this.logger.log(`Genesis Lock round successfully!`);

      // Update genesis lock preference
      await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.PREDICTION, {
        genesis_lock: true,
      });
    }

    // Execute round failed
    else {
      this.logger.log(`Genesis Lock round failed! retry...`);
      await this.genesisLockRound();
    }
  }

  async cancelCurrentRound() {
    const currentRounds = await this.db.predictionRepo.getCollectionDataByConditions([
      {
        field: 'closed',
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

  async automaticBotBet(limit: number) {
    const round = await this.db.predictionRepo.getFirstValueCollectionDataByConditionsAndOrderBy(
      [
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
      ],
      [
        {
          field: 'epoch',
          option: 'desc',
        },
      ],
    );

    const betDown = await this.db.betRepo.getCollectionDataByConditions([
      {
        field: 'epoch',
        operator: '==',
        value: round.epoch,
      },
      {
        field: 'position',
        operator: '==',
        value: constant.BET.POS.DOWN,
      },
    ]);

    const betUp = await this.db.betRepo.getCollectionDataByConditions([
      {
        field: 'epoch',
        operator: '==',
        value: round.epoch,
      },
      {
        field: 'position',
        operator: '==',
        value: constant.BET.POS.UP,
      },
    ]);

    if (!betDown && betUp) {
      await this.betBear(round.epoch.toString(), this.getRandomAmount().toString());
    } else if (!betUp && betDown) {
      await this.betBull(round.epoch.toString(), this.getRandomAmount().toString());
    } else if (betDown && betUp) {
      let totalBetDown = 0;
      let totalBetUp = 0;

      for (const bet of betDown) {
        totalBetDown += bet.amount;
      }
      for (const bet of betUp) {
        totalBetUp += bet.amount;
      }
      const limitt = this.getGap(totalBetDown, totalBetUp);

      if (limitt > limit) {
        if (totalBetDown > totalBetUp) {
          await this.betBull(round.epoch.toString(), this.getRandomAmount().toString());
        } else {
          await this.betBear(round.epoch.toString(), this.getRandomAmount().toString());
        }
      }
    }
  }

  async betBear(epoch: string, amount: string) {
    const gasLimit = await this.factory.predictionContract.betBear.estimateGas(epoch, amount);
    const gasPrice = await this.factory.provider.getFeeData();

    const executeRoundTx = await this.factory.predictionContract.betBear(epoch, amount, {
      gasLimit,
      gasPrice: gasPrice.gasPrice,
      maxFeePerGas: gasPrice.maxFeePerGas,
      maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
    });

    const executeRound = await this.factory.provider.waitForTransaction(executeRoundTx.hash as string);

    // Execute round success
    if (executeRound.status === 1) {
      console.log(`Autobot bet bear ${parseInt(amount) / 10 ** 18} PRX successfully on round ${epoch.toString()}!`);
    }

    // Execute round failed
    else {
      console.log(` Autobot bet bear failed on round ${epoch.toString()} ! `);
    }
  }

  async betBull(epoch: string, amount: string) {
    const gasLimit = await this.factory.predictionContract.betBull.estimateGas(epoch, amount);
    const gasPrice = await this.factory.provider.getFeeData();

    const executeRoundTx = await this.factory.predictionContract.betBull(epoch, amount, {
      gasLimit,
      gasPrice: gasPrice.gasPrice,
      maxFeePerGas: gasPrice.maxFeePerGas,
      maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
    });

    const executeRound = await this.factory.provider.waitForTransaction(executeRoundTx.hash as string);

    // Execute round success
    if (executeRound.status === 1) {
      console.log(`Autobot bet bull ${parseInt(amount) / 10 ** 18} PRX successfully on round ${epoch.toString()}!`);
    }

    // Execute round failed
    else {
      console.log(`Autobot bet bull failed on round ${epoch.toString()}! `);
    }
  }

  getRandomAmount() {
    return (Math.floor(Math.random() * (2000 - 500 + 1)) + 500) * 10 ** 18;
  }

  getGap(a: number, b: number) {
    return Math.abs(a / 10 ** 18 - b / 10 ** 18);
  }
}
