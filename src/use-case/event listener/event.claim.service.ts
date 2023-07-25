import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import constant from 'src/configuration';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';

@Injectable()
export class EventClaimListener implements OnApplicationBootstrap {
  async onApplicationBootstrap() {
    if (constant.ENABLE) {
      await this.listenClaim();
    }
  }

  constructor(private readonly factory: ContractFactoryAbstract, private readonly db: IDataServices) {}

  async listenClaim() {
    await this.factory.predictionContract.on('Claim', async (sender: string, epoch: bigint, amount: bigint) => {
      const bet = await this.db.betRepo.getFirstValueCollectionDataByConditions([
        {
          field: 'epoch',
          operator: '==',
          value: epoch.toString(),
        },
        {
          field: 'user_address',
          operator: '==',
          value: sender,
        },
      ]);

      await this.db.betRepo.upsertDocumentData(bet.id, { claimed: true, claimed_amount: parseInt(amount.toString()) });
    });
  }
}
