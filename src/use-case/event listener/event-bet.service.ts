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
      //Const
      const betAmount = parseInt(amount.toString());

      //Round
      const round = await this.db.predictionRepo.getFirstValueCollectionDataByConditions([
        {
          field: 'epoch',
          operator: '==',
          value: parseInt(epoch.toString()),
        },
      ]);

      round.totalAmount += betAmount;
      round.bearAmount += betAmount;

      await this.db.predictionRepo.upsertDocumentData(round.epoch.toString(), round);

      //Preferences
      const preferences = await this.db.preferenceRepo.getFirstValueCollectionData();
      let winning_amount = betAmount;

      if (preferences) {
        winning_amount = (betAmount * (preferences.fee * 2)) / 10000;
      }

      const bet: Bet = {
        amount: betAmount,
        claimed: false,
        created_at: new Date().getTime(),
        delete: false,
        epoch: parseInt(epoch.toString()),
        position: 'DOWN',
        status: 'Waiting',
        winning_amount,
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
      //Const
      const betAmount = parseInt(amount.toString());

      //Round
      const round = await this.db.predictionRepo.getFirstValueCollectionDataByConditions([
        {
          field: 'epoch',
          operator: '==',
          value: parseInt(epoch.toString()),
        },
      ]);

      round.totalAmount += betAmount;
      round.bullAmount += betAmount;

      await this.db.predictionRepo.upsertDocumentData(round.epoch.toString(), round);

      //Preferences
      const preferences = await this.db.preferenceRepo.getFirstValueCollectionData();
      let winning_amount = betAmount;

      if (preferences) {
        winning_amount = betAmount - (betAmount * (preferences.fee * 2)) / 10000;
      }

      const bet: Bet = {
        amount: betAmount,
        claimed: false,
        created_at: new Date().getTime(),
        delete: false,
        epoch: parseInt(epoch.toString()),
        position: 'UP',
        status: 'Waiting',
        winning_amount,
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
        //Const
        const amount = parseInt(betAmount.toString());
        const refund = parseInt(refundAmount.toString());

        //Bet
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

        if (!bet) {
          return;
        }

        //Preferences
        const preferences = await this.db.preferenceRepo.getFirstValueCollectionData();

        bet.amount = amount;
        bet.refund = refund;

        // Calculate winning amount
        if (amount > 0 && preferences) {
          bet.winning_amount = amount - (amount * (preferences.fee * 2)) / 10000;
        }

        // Refund bet to use if bet amount being cut all
        else if (amount == 0) {
          bet.winning_amount = 0;
        }

        // Set winning amount = amount bet if no preferences
        else if (!preferences) {
          bet.winning_amount = amount;
        }

        // Log
        await this.db.betRepo.upsertDocumentData(bet.id, bet);
      },
    );
  }
}
