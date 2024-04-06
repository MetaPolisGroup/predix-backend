/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import constant from 'src/configuration';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { Chart } from 'src/core/entity/chart.entity';

@Injectable()
export class ChainlinkTaskService implements OnApplicationBootstrap {
    private logger: ILogger;

    async onApplicationBootstrap() {}

    constructor(
        private readonly factory: ContractFactoryAbstract,
        private readonly db: IDataServices,
        private readonly logFactory: ILoggerFactory,
    ) {
        this.logger = this.logFactory.chainlinkLogger;
    }

    // @Cron('*/5 * * * * *')
    // async updatePriceFromChainlinkChart() {
    //   const chainlinkPrice = await this.factory.aggregatorContract.latestRoundData();

    //   if (!chainlinkPrice) {
    //     this.logger.warn('No chainlink data to update chart !');
    //     return;
    //   }

    //   const chart: Chart = {
    //     created_at: parseInt(chainlinkPrice[2].toString()),
    //     delete: false,
    //     price: parseInt(chainlinkPrice[1].toString()),
    //   };

    //   await this.db.chartRepo.upsertDocumentData(parseInt(chainlinkPrice[2].toString()).toString(), chart);
    // }

    // @Cron('*/5 * * * * *')
    // async updatePriceFromChainlink() {
    //   const chainlinkPrice = await this.factory.aggregatorContract.latestRoundData();

    //   if (!chainlinkPrice) {
    //     this.logger.warn('No chainlink data to update price !');
    //     return;
    //   }

    //   // Implement
    //   await this.db.chainlinkRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.CHAINLINK, {
    //     price: chainlinkPrice[1].toString(),
    //     updated_at: new Date().getTime(),
    //   });
    // }
}
