import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { BetPredictionService } from '../../bet/prediction/bet-prediction.service';
import { BetDiceService } from 'src/use-case/bet/dice/bet-dice.service';

@Injectable()
export class EventDiceBetListener implements OnApplicationBootstrap {
  async onApplicationBootstrap() {
    if (process.env.CONSTANT_ENABLE_DICE === 'True') {
      await this.listenBetBear();
      await this.listenBetBull();
      await this.listenCutBetUser();
    }
  }

  constructor(private readonly factory: ContractFactoryAbstract, private readonly betDice: BetDiceService) {}

  async listenBetBear() {
    await this.factory.diceContract.on('BetBear', async (sender: string, epoch: bigint, amount: bigint) => {
      // Handle bet
      await this.betDice.userBetBear(sender, epoch, amount);
    });
  }

  async listenBetBull() {
    await this.factory.diceContract.on('BetBull', async (sender: string, epoch: bigint, amount: bigint) => {
      // Handle bet
      await this.betDice.userBetBull(sender, epoch, amount);
    });
  }

  async listenCutBetUser() {
    await this.factory.diceContract.on(
      'CutBetUser',
      async (epoch: bigint, sender: string, betAmount: bigint, refundAmount: bigint, totalBetRound: bigint) => {
        // Handle cut bet
        await this.betDice.userCutBet(epoch, sender, betAmount, refundAmount);
      },
    );
  }
}
