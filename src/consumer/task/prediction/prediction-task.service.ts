/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';

@Injectable()
export class PredictionTaskService implements OnApplicationBootstrap {
    async onApplicationBootstrap() {}

    constructor(
        private readonly factory: ContractFactoryAbstract,
        private readonly db: IDataServices,
    ) {}

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
