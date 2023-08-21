import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ethers } from 'ethers';
import constant from 'src/configuration';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';

@Injectable()
export class EventDiceClaimListener implements OnApplicationBootstrap {
  private logger: Logger;

  async onApplicationBootstrap() {
    if (process.env.CONSTANT_ENABLE_DICE === 'True') {
      await this.listenClaim();
    }
  }

  constructor(private readonly factory: ContractFactoryAbstract, private readonly db: IDataServices) {
    this.logger = new Logger(EventDiceClaimListener.name);
  }

  async listenClaim() {
    await this.factory.diceContract.on('Claim', async (sender: string, epoch: bigint, amount: bigint) => {
      const bet = await this.db.betDiceRepo.getFirstValueCollectionDataByConditions([
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

      await this.db.betDiceRepo.upsertDocumentData(bet.id, { claimed: true, claimed_amount: parseInt(amount.toString()) });

      this.logger.log(`${sender} claim ${ethers.formatEther(amount)} !`);
    });
  }
}
