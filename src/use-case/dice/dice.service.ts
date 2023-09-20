/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { CronJob } from 'cron';
import constant from 'src/configuration';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { Dice } from 'src/core/entity/dice.entity';
import { Prediction } from 'src/core/entity/prediction.enity';
import { Preferences } from 'src/core/entity/preferences.entity';
import { HelperService } from '../helper/helper.service';

@Injectable()
export class DiceService implements OnApplicationBootstrap {
  private cronJobs: { [id: string]: CronJob } = {};

  private logger: Logger;

  async onApplicationBootstrap() {
    await this.updateContractState();
  }

  constructor(
    private readonly factory: ContractFactoryAbstract,
    private readonly db: IDataServices,
    private readonly helper: HelperService,
  ) {
    this.logger = new Logger(DiceService.name);
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

  async setCronjob(availableRound: Dice) {
    // Consts

    const now = parseInt((new Date().getTime() / 1000).toString());
    const genesis_start = await this.factory.diceContract.genesisStartOnce();
    const genesis_end = await this.factory.diceContract.genesisEndOnce();
    const paused = await this.factory.diceContract.paused();
    // Log

    if (paused) {
      this.logger.log(`Dice contract is paused !`);
      return;
    }

    if (this.cronJobs[availableRound?.epoch]) {
      this.logger.log(`Cronjob for round ${availableRound.epoch} have already set !`);
      return;
    }

    if (!genesis_start && !genesis_end) {
      this.logger.warn(`Only execute round after Genesis Start and Genesis End`);
      return;
    }

    if (!availableRound) {
      this.logger.warn(`No available round to set cronjob !`);
      return;
    }

    const preferences = await this.db.preferenceRepo.getDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.DICE);
    if (!preferences) {
      this.logger.error(`Preferences not found when set cronjob`);
      return;
    }

    //

    if (genesis_start && !genesis_end) {
      const date = new Date((availableRound.startTimestamp + preferences.interval_seconds) * 1000);
      if (date.getTime() / 1000 < now) {
        await this.genesisEndRound();
        return;
      }
      this.createCronJob(date, availableRound.epoch, async () => {
        await this.genesisEndRound();
      });
    }

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

  async executeRound() {
    const d1 = this.getDice();
    const d2 = this.getDice();
    const d3 = this.getDice();

    if (!d1 || !d2 || !d3) {
      this.logger.warn('Get dice failed !');
      return;
    }

    await this.helper.executeContract(
      this.factory.diceContract,
      'executeRound',
      'New Dice round execute successfully!',
      'New Dice round executed failed! retry...',
      async () => await this.executeRound(),
      undefined,
      constant.GAS,
      d1,
      d2,
      d3,
    );
  }

  async updateContractState() {
    const preference: Preferences = {
      fee: null,
      genesis_start: null,
      interval_seconds: null,
      paused: null,
    };

    if (!preference) {
      this.logger.warn('Preference not found when update state Dice contract !');
      return;
    }

    const genesisStart = await this.factory.diceContract.genesisStartOnce();

    const genesisEnd = await this.factory.diceContract.genesisEndOnce();

    const intervalSeconds = await this.factory.diceContract.intervalSeconds();

    const treasuryFee = await this.factory.diceContract.treasuryFee();

    const paused = await this.factory.diceContract.paused();

    if (genesisStart !== undefined) {
      preference.genesis_start = genesisStart;
    }

    if (genesisEnd !== undefined) {
      preference.genesis_end = genesisEnd;
    }

    if (paused !== undefined) {
      preference.paused = paused;
    }

    if (intervalSeconds !== undefined) {
      preference.interval_seconds = parseInt(intervalSeconds.toString());
    }

    if (treasuryFee !== undefined) {
      preference.fee = parseInt(treasuryFee.toString());
    }

    await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.DICE, preference);

    if (genesisStart === undefined) {
      this.logger.warn("Can't get Genesis Start from Dice contract !");
    }

    if (genesisEnd === undefined) {
      this.logger.warn("Can't get Genesis End from Dice contract !");
    }

    if (paused === undefined) {
      this.logger.warn("Can't get Paused from Dice contract !");
    }

    if (!treasuryFee) {
      this.logger.warn("Can't get Fee from Dice contract !");
    }

    if (!intervalSeconds) {
      this.logger.warn("Can't get Interval seconds from Dice contract !");
    }
  }

  async genesisStartRound() {
    await this.helper.executeContract(
      this.factory.diceContract,
      'genesisStartRound',
      'Genesis start round successfully!',
      'Genesis start failed! retry...',
      async () => {
        await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.DICE, {
          genesis_start: true,
        });
      },
      async () => await this.genesisStartRound(),

      constant.GAS,
    );
  }

  async genesisEndRound() {
    const d1 = this.getDice();
    const d2 = this.getDice();
    const d3 = this.getDice();

    if (!d1 || !d2 || !d3) {
      this.logger.warn('Get dice failed !');
      return;
    }

    await this.helper.executeContract(
      this.factory.diceContract,
      'genesisEndRound',
      'Genesis emd round successfully!',
      'Genesis emd failed! retry...',
      async () => {
        await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.DICE, {
          genesis_end: true,
        });
      },
      async () => await this.genesisStartRound(),

      constant.GAS,
      d1,
      d2,
      d3,
    );
  }

  async cancelCurrentRound() {
    const currentRounds = await this.db.diceRepo.getCollectionDataByConditions([
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
        await this.db.diceRepo.upsertDocumentData(round.epoch.toString(), {
          cancel: true,
        });
      }
    }
  }

  private getDice() {
    // Generate a random decimal between 0 and 1
    const randomDecimal = Math.random();

    // Scale the random decimal to a value between 1 and 6
    const randomNumber = Math.floor(randomDecimal * 6) + 1;

    return randomNumber.toString();
  }
}
