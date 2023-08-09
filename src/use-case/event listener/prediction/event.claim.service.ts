import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ethers } from 'ethers';
import constant from 'src/configuration';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';

@Injectable()
export class EventClaimListener implements OnApplicationBootstrap {
  private logger: Logger;

  async onApplicationBootstrap() {
    if (process.env.CONSTANT_ENABLE === 'True') {
      await this.listenClaim();
      await this.listenClaimCommision();
    }
  }

  constructor(private readonly factory: ContractFactoryAbstract, private readonly db: IDataServices) {
    this.logger = new Logger(EventClaimListener.name);
  }

  async listenClaim() {
    await this.factory.predictionContract.on('Claim', async (sender: string, epoch: bigint, amount: bigint) => {
      const bet = await this.db.betRepo.getFirstValueCollectionDataByConditions([
        {
          field: 'epoch',
          operator: '==',
          value: parseInt(epoch.toString()),
        },
        {
          field: 'user_address',
          operator: '==',
          value: sender,
        },
      ]);

      await this.db.betRepo.upsertDocumentData(bet.id, { claimed: true, claimed_amount: parseInt(amount.toString()) });

      this.logger.log(`${sender} claim ${ethers.formatEther(amount)} !`);
    });
  }

  async listenClaimCommision() {
    await this.factory.predictionContract.on('CommissionClaim', async (sender: string, amount: bigint) => {
      await this.db.userRepo.upsertDocumentData(sender, { point: 0 });

      this.logger.log(`${sender} claim ${ethers.formatEther(amount)} commision !`);
    });
  }
}
