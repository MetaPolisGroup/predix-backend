import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { Chart } from 'src/core/entity/chart.entity';
import { ChainlinkService } from 'src/use-case/chainlink/chainlink.service';
import { ChartService } from 'src/use-case/chart/chart.service';

@Injectable()
export class ChainlinkTaskService implements OnApplicationBootstrap {
    private logger: ILogger;

    async onApplicationBootstrap() {}

    constructor(
        private readonly chart: ChartService,
        private readonly logFactory: ILoggerFactory,
        private readonly chainlink: ChainlinkService,
    ) {
        this.logger = this.logFactory.chainlinkLogger;
    }

    @Cron('*/5 * * * * *')
    async updatePriceFromChainlinkChart() {
        const chainlinkPrice = await this.chainlink.getChainlinkLatestData();

        const chart: Chart = {
            created_at: chainlinkPrice.started_at,

            price: chainlinkPrice.answer,
        };

        await this.chart.upsertChart(chainlinkPrice.started_at.toString(), chart);
    }
}
