import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import constant from 'src/configuration';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { Bet } from 'src/core/entity/bet.entity';

@Injectable()
export class EventBetListener implements OnApplicationBootstrap {
  async onApplicationBootstrap() {
    if (process.env.CONSTANT_ENABLE === 'True') {
      await this.listenBetBear();
      await this.listenBetBull();
      await this.listenCutBetUser();
    }
  }

  constructor(private readonly factory: ContractFactoryAbstract, private readonly db: IDataServices) {}

  async listenBetBear() {
    await this.factory.predictionContract.on('BetBear', async (sender: string, epoch: bigint, amount: bigint) => {
      const round = await this.db.predictionRepo.getFirstValueCollectionDataByConditions([
        {
          field: 'epoch',
          operator: '==',
          value: epoch.toString(),
        },
      ]);

      round.totalAmount += parseInt(amount.toString());
      round.bearAmount += parseInt(amount.toString());

      await this.db.predictionRepo.upsertDocumentData(round.epoch.toString(), round);
      const bet: Bet = {
        amount: parseInt(amount.toString()),
        claimed: false,
        created_at: new Date().getTime(),
        delete: false,
        epoch: epoch.toString(),
        position: 'DOWN',
        status: 'Waiting',
        winning_amount: parseInt(amount.toString()) - (parseInt(amount.toString()) * (3 * 2)) / 100,
        refund: 0,
        claimed_amount: 0,
        round,
        user_address: sender,
      };

      await this.db.betRepo.createDocumentData(bet);
    });
  }

  async listenBetBull() {
    await this.factory.predictionContract.on('BetBull', async (sender: string, epoch: bigint, amount: bigint) => {
      const round = await this.db.predictionRepo.getFirstValueCollectionDataByConditions([
        {
          field: 'epoch',
          operator: '==',
          value: epoch.toString(),
        },
      ]);

      round.totalAmount += parseInt(amount.toString());
      round.bullAmount += parseInt(amount.toString());

      await this.db.predictionRepo.upsertDocumentData(round.epoch.toString(), round);

      const bet: Bet = {
        amount: parseInt(amount.toString()),
        claimed: false,
        created_at: new Date().getTime(),
        delete: false,
        epoch: epoch.toString(),
        position: 'UP',
        status: 'Waiting',
        winning_amount: parseInt(amount.toString()) - (parseInt(amount.toString()) * (3 * 2)) / 100,
        refund: 0,
        claimed_amount: 0,
        round,
        user_address: sender,
      };

      await this.db.betRepo.createDocumentData(bet);
    });
  }

  async listenCutBetUser() {
    await this.factory.predictionContract.on(
      'CutBetUser',
      async (epoch: bigint, sender: string, betAmount: bigint, refundAmount: bigint, totalBetRound: bigint) => {
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

        bet.amount = parseInt(betAmount.toString());
        bet.refund = parseInt(refundAmount.toString());
        bet.winning_amount = parseInt(betAmount.toString()) - (parseInt(betAmount.toString()) * (3 * 2)) / 100;

        await this.db.betRepo.upsertDocumentData(bet.id, bet);
      },
    );
  }
}
