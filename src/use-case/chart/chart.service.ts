/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { Chart } from 'src/core/entity/chart.entity';

@Injectable()
export class ChartService implements OnApplicationBootstrap {
    async onApplicationBootstrap() {}

    constructor(
        private readonly factory: ContractFactoryAbstract,
        private readonly db: IDataServices,
    ) {}

    async upsertChart(id: string, chart: Chart | object) {
        return this.db.chartRepo.upsertDocumentData(id, chart);
    }
}
