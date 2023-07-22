import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { Bet } from 'src/core/interface/bet/bet.entity';

@Injectable()
export class EventBetListener implements OnApplicationBootstrap {
  async onApplicationBootstrap() {
    await this.listenBetBear();
    await this.listenBetBull();
  }

  constructor(private readonly factory: ContractFactoryAbstract, private readonly db: IDataServices) {}

  async listenBetBear() {
    await this.factory.predictionContract.on('BetBear', async (sender: string, epoch: bigint, amount: bigint) => {
      const bet: Bet = {
        amount,
        claimed: false,
        created_at: new Date().getTime(),
        delete: false,
        epoch: epoch.toString(),
        position: 'DOWN',
        refund: BigInt(0),
        claimed_amount: BigInt(0),
        round: null,
        user_address: sender,
      };

      await this.db.betRepo.createDocumentData(bet);

      const round = await this.db.roundRepo.getFirstValueCollectionDataByConditions([
        {
          field: 'epoch',
          operator: '==',
          value: epoch.toString(),
        },
      ]);

      round.totalAmount += amount;
      round.bearAmount += amount;

      await this.db.roundRepo.upsertDocumentData(round.epoch, round);
    });
  }

  async listenBetBull() {
    await this.factory.predictionContract.on('BetBull', async (sender: string, epoch: bigint, amount: bigint) => {
      const round = await this.db.roundRepo.getFirstValueCollectionDataByConditions([
        {
          field: 'epoch',
          operator: '==',
          value: epoch.toString(),
        },
      ]);

      round.totalAmount += amount;
      round.bullAmount += amount;

      await this.db.roundRepo.upsertDocumentData(round.epoch, round);

      const bet: Bet = {
        amount,
        claimed: false,
        created_at: new Date().getTime(),
        delete: false,
        epoch: epoch.toString(),
        position: 'UP',
        refund: BigInt(0),
        claimed_amount: BigInt(0),
        round: null,
        user_address: sender,
      };

      await this.db.betRepo.createDocumentData(bet);
    });
  }
}
