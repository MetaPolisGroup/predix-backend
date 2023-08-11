/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import constant from 'src/configuration';
import { BetStatus } from 'src/configuration/type';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { Bet } from 'src/core/entity/bet.entity';
import { Market } from 'src/core/entity/market.entity';

@Injectable()
export class BetMarketService implements OnApplicationBootstrap {
  private logger: Logger;

  async onApplicationBootstrap() {}

  constructor(private readonly db: IDataServices) {
    this.logger = new Logger(BetMarketService.name);
  }

  async userBetBear(sender: string, epoch: bigint, amount: bigint) {
    //Const
    const betAmount = parseInt(amount.toString());

    const round = await this.db.marketRepo.getFirstValueCollectionDataByConditions([
      {
        field: 'epoch',
        operator: '==',
        value: parseInt(epoch.toString()),
      },
    ]);

    round.totalAmount += betAmount;
    round.bearAmount += betAmount;

    await this.db.marketRepo.upsertDocumentData(round.epoch.toString(), round);

    //Preferences
    const preferences = await this.db.preferenceRepo.getDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.MARKET);
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
      position: constant.BET.POS.DOWN,
      status: constant.BET.STATUS.WAITING,
      winning_amount,
      refund: 0,
      claimed_amount: 0,
      round,
      user_address: sender,
    };

    await this.db.betMarketRepo.createDocumentData(bet);
  }

  async userBetBull(sender: string, epoch: bigint, amount: bigint) {
    //Const
    const betAmount = parseInt(amount.toString());

    //Round
    const round = await this.db.marketRepo.getFirstValueCollectionDataByConditions([
      {
        field: 'epoch',
        operator: '==',
        value: parseInt(epoch.toString()),
      },
    ]);

    round.totalAmount += betAmount;
    round.bullAmount += betAmount;

    await this.db.marketRepo.upsertDocumentData(round.epoch.toString(), round);

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
      position: constant.BET.POS.UP,
      status: constant.BET.STATUS.WAITING,
      winning_amount,
      refund: 0,
      claimed_amount: 0,
      round,
      user_address: sender,
    };

    await this.db.betMarketRepo.createDocumentData(bet);
  }

  async userCutBet(epoch: bigint, sender: string, betAmount: bigint, refundAmount: bigint) {
    // Const
    const amount = parseInt(betAmount.toString());
    const refund = parseInt(refundAmount.toString());

    // Bet
    const bet = await this.db.betMarketRepo.getFirstValueCollectionDataByConditions([
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
    const preferences = await this.db.preferenceRepo.getDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.MARKET);

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
    await this.db.betMarketRepo.upsertDocumentData(bet.id, bet);
  }

  async updateBetWhenRoundIsEnded(epoch: bigint) {
    const round = await this.db.marketRepo.getFirstValueCollectionDataByConditions([
      {
        field: 'epoch',
        operator: '==',
        value: parseInt(epoch.toString()),
      },
    ]);

    //Update bets
    const bets = await this.db.betMarketRepo.getCollectionDataByConditions([
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

        await this.db.betMarketRepo.upsertDocumentData(bet.id, bet);

        // Handle commission
        // await this.handleMoney.handlePoint(bet.amount, bet.user_address);
      }
    }

    // Log
    this.logger.log(`Round ${epoch.toString()} has ended !`);
  }

  private calculateResult(bet: Bet, round: Market): BetStatus {
    let result: BetStatus;

    if ((round.result === 'Up' && bet.position === 'UP') || (round.result === 'Down ' && bet.position === 'DOWN')) {
      result = 'Win';
      if (bet.refund > 0) {
        result = 'Winning Refund';
      }
    } else {
      result = 'Lose';
      if (bet.refund > 0) {
        result = 'Losing Refund';
      }
    }

    return result;
  }
}
