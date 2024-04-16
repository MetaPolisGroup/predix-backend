import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ethers } from 'ethers';
import constant from 'src/configuration';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';

@Injectable()
export class EventMarketClaimListener implements OnApplicationBootstrap {
    private logger: ILogger;

    async onApplicationBootstrap() {
        if (process.env.CONSTANT_ENABLE_MARKET === 'True') {
            await this.listenClaim();
        }
    }

    constructor(
        private readonly factory: ContractFactoryAbstract,
        private readonly db: IDataServices,
        private readonly logFactory: ILoggerFactory,
    ) {
        this.logger = this.logFactory.marketLogger;
    }

    async listenClaim() {
        // await this.factory.marketContract.on('Claim', async (sender: string, epoch: bigint, amount: bigint) => {
        //   const bet = await this.db.betMarketRepo.getFirstValueCollectionDataByConditions([
        //     {
        //       field: 'epoch',
        //       operator: '==',
        //       value: parseInt(epoch.toString()),
        //     },
        //     {
        //       field: 'user_address',
        //       operator: '==',
        //       value: sender,
        //     },
        //   ]);
        //   await this.db.betMarketRepo.upsertDocumentData(bet.id, { claimed: true, claimed_amount: parseInt(amount.toString()) });
        //   this.logger.log(`${sender} claim ${ethers.formatEther(amount)} !`);
        // });
    }
}
