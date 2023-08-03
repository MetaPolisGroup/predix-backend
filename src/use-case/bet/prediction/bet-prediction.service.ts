/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { Bet, BetStatus } from 'src/core/entity/bet.entity';
import { Prediction } from 'src/core/entity/prediction.enity';
import { UserHandleMoney } from 'src/use-case/user/user-handle-money.service';

@Injectable()
export class BetPredictionService implements OnApplicationBootstrap {
  private logger: Logger;

  async onApplicationBootstrap() {}

  constructor(private readonly db: IDataServices, private readonly handleMoney: UserHandleMoney) {}

  async userBetBear(sender: string, epoch: bigint, amount: bigint) {
    //Const
    const betAmount = parseInt(amount.toString());

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
  }

  async userBetBull(sender: string, epoch: bigint, amount: bigint) {
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
  }

  async userCutBet(epoch: bigint, sender: string, betAmount: bigint, refundAmount: bigint) {
    // Const
    const amount = parseInt(betAmount.toString());
    const refund = parseInt(refundAmount.toString());

    // Bet
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

    // Set winning amount = amount bet if no preferences
    else if (!preferences) {
      bet.winning_amount = amount;
    }

    // Refund bet to use if bet amount being cut all
    else if (amount == 0) {
      bet.winning_amount = 0;
    }

    // Upsert
    await this.db.betRepo.upsertDocumentData(bet.id, bet);
  }

  async updateBetWhenRoundIsLocked(epoch: bigint) {
    const round = await this.db.predictionRepo.getFirstValueCollectionDataByConditions([
      {
        field: 'epoch',
        operator: '==',
        value: parseInt(epoch.toString()),
      },
    ]);

    const bets = await this.db.betRepo.getCollectionDataByConditions([
      {
        field: 'epoch',
        operator: '==',
        value: parseInt(epoch.toString()),
      },
    ]);

    // Change bets's status to live
    if (bets) {
      for (const bet of bets) {
        await this.db.betRepo.upsertDocumentData(bet.id, {
          round: round ? round : null,
          status: 'Live',
        });
      }
    }

    // Log
    this.logger.log(`Round ${epoch.toString()} has locked !`);
  }

  async updateBetWhenRoundIsEnded(epoch: bigint) {
    const round = await this.db.predictionRepo.getFirstValueCollectionDataByConditions([
      {
        field: 'epoch',
        operator: '==',
        value: parseInt(epoch.toString()),
      },
    ]);

    //Update bets
    const bets = await this.db.betRepo.getCollectionDataByConditions([
      {
        field: 'epoch',
        operator: '==',
        value: parseInt(epoch.toString()),
      },
    ]);

    // Update bet status & round
    if (bets) {
      for (const bet of bets) {
        bet.round = round ? round : null;
        bet.status = 'Refund';

        // Calculate result if bet amount > 0
        if (round && bet.amount > 0) {
          bet.status = this.calculateResult(bet, round);
        }

        await this.db.betRepo.upsertDocumentData(bet.id, bet);

        // Handle commission
        await this.handleMoney.handlePoint(bet.amount, bet.user_address);
      }
    }

    // Log
    this.logger.log(`Round ${epoch.toString()} has ended !`);
  }

  private calculateResult(bet: Bet, round: Prediction): BetStatus {
    const r = round.closePrice - round.lockPrice;
    let result: BetStatus;

    if ((r > 0 && bet.position === 'UP') || (r < 0 && bet.position === 'DOWN')) {
      result = 'Win';
      if (bet.refund > 0) {
        result = 'Winning Refund';
      }
    } else {
      result = 'Lose';
      if (bet.refund > 0) {
        result = 'Refund';
      }
    }

    return result;
  }
}
