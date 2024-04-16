import { Injectable } from '@nestjs/common';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { ContractGenericAbstract } from 'src/core/abstract/contract-factory/contract-generic.abstract';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { ChainlinkData, ExecuteData } from 'src/core/entity/chainlink.entity';
import { HelperService } from '../helper/helper.service';

@Injectable()
export class ChainlinkService {
    private contract: ContractGenericAbstract;

    private logger: ILogger;

    constructor(
        private readonly factory: ContractFactoryAbstract,
        private readonly loggerFactory: ILoggerFactory,
    ) {
        this.contract = this.factory.aggregatorContract;
        this.logger = this.loggerFactory.chainlinkLogger;
    }

    async getChainLinkExecutionData() {
        const chainlinkPrice = await this.getChainlinkLatestData();
        if (!chainlinkPrice) {
            return;
        }

        const executeData: ExecuteData = {
            roundId: chainlinkPrice.roundId,
            price: chainlinkPrice.answer,
        };

        return executeData;
    }

    async getChainlinkLatestData() {
        const chainlinkRaw = await this.contract.readContract('latestRoundData');

        if (!chainlinkRaw) {
            this.logger.warn('No chainlink data to update chart !');
            return;
        }

        const chainlinkdata: ChainlinkData = {
            roundId: chainlinkRaw[0],
            answer: chainlinkRaw[1],
            started_at: chainlinkRaw[2],
            updated_at: chainlinkRaw[3],
            answered_in_Round: chainlinkRaw[4],
        };

        return chainlinkdata;
    }
}
