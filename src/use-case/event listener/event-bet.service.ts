import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { BetPredictionService } from '../bet/prediction/bet-prediction.service';

@Injectable()
export class EventBetListener implements OnApplicationBootstrap {
  async onApplicationBootstrap() {
    if (process.env.CONSTANT_ENABLE === 'True') {
      await this.listenBetBear();
      await this.listenBetBull();
      await this.listenCutBetUser();
    }
  }

  constructor(private readonly factory: ContractFactoryAbstract, private readonly betPrediction: BetPredictionService) {}

  async listenBetBear() {
    await this.factory.predictionContract.on('BetBear', async (sender: string, epoch: bigint, amount: bigint) => {
      // Handle bet
      await this.betPrediction.userBetBear(sender, epoch, amount);
    });
  }

  async listenBetBull() {
    await this.factory.predictionContract.on('BetBull', async (sender: string, epoch: bigint, amount: bigint) => {
      // Handle bet
      await this.betPrediction.userBetBull(sender, epoch, amount);
    });
  }

  async listenCutBetUser() {
    await this.factory.predictionContract.on(
      'CutBetUser',
      async (epoch: bigint, sender: string, betAmount: bigint, refundAmount: bigint, totalBetRound: bigint) => {
        // Handle cut bet
        await this.betPrediction.userCutBet(epoch, sender, betAmount, refundAmount);
      },
    );
  }
}
