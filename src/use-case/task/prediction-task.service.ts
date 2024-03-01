/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import constant from 'src/configuration';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { Chart } from 'src/core/entity/chart.entity';

@Injectable()
export class PredictionTaskService implements OnApplicationBootstrap {
  private logger: Logger;

  async onApplicationBootstrap() {}

  constructor(private readonly factory: ContractFactoryAbstract, private readonly db: IDataServices) {
    this.logger = new Logger(PredictionTaskService.name);
  }

  // @Cron('*/2 * * * * *')
  // async updateBetAmount() {
  //   const availableRound = await this.db.predictionRepo.getFirstValueCollectionDataByConditions([
  //     {
  //       field: 'locked',
  //       operator: '==',
  //       value: false,
  //     },
  //     {
  //       field: 'cancel',
  //       operator: '==',
  //       value: false,
  //     },
  //   ]);

  //   if (!availableRound) {
  //     this.logger.warn('No available round when update bet amount !');
  //     return;
  //   }

  //   const round = await this.factory.predictionContract.rounds(availableRound.epoch);
  //   const bullAmount = parseInt(round[9].toString());
  //   const bearAmount = parseInt(round[10].toString());

  //   await this.db.predictionRepo.upsertDocumentData(availableRound.epoch.toString(), {
  //     bearAmount,
  //     bullAmount,
  //   });
  // }
}
