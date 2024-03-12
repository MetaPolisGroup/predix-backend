import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { BetMarketService } from 'src/use-case/bet/market/bet-market.service';

@Injectable()
export class EventMarketBetListener implements OnApplicationBootstrap {
  async onApplicationBootstrap() {
    if (process.env.CONSTANT_ENABLE_MARKET === 'True') {
      await this.listenBetBear();
      await this.listenBetBull();
      await this.listenCutBetUser();
    }
  }

  constructor(private readonly factory: ContractFactoryAbstract, private readonly betMarket: BetMarketService) { }

  async listenBetBear() {
    await this.factory.marketContract.on('BetBear', async (sender: string, epoch: bigint, amount: bigint) => {
      // Handle bet
      await this.betMarket.userBetBear(sender, epoch, amount);
    });
  }

  async listenBetBull() {
    await this.factory.marketContract.on('BetBull', async (sender: string, epoch: bigint, amount: bigint) => {
      // Handle bet
      await this.betMarket.userBetBull(sender, epoch, amount);
    });
  }

  async listenCutBetUser() {
    await this.factory.marketContract.on(
      'CutBetUser',
      async (epoch: bigint, sender: string, betAmount: bigint, refundAmount: bigint, totalBetRound: bigint) => {
        // Handle cut bet
        await this.betMarket.userCutBet(epoch, sender, betAmount, refundAmount);
      },
    );
  }
}
