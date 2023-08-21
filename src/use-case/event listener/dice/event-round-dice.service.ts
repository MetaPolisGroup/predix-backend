/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { BetDiceService } from 'src/use-case/bet/dice/bet-dice.service';
import { BetPredictionService } from 'src/use-case/bet/prediction/bet-prediction.service';
import { DiceRoundService } from 'src/use-case/dice/dice-round.service';

@Injectable()
export class EventDiceRoundListener implements OnApplicationBootstrap {
  private Logger: Logger;

  async onApplicationBootstrap() {
    if (process.env.CONSTANT_ENABLE_DICE === 'True') {
      await this.listenRoundStart();
      await this.listenRoundEnd();
      await this.listenCutBetRound();
    }
    this.Logger = new Logger(EventDiceRoundListener.name);
  }

  constructor(
    private readonly factory: ContractFactoryAbstract,
    private readonly db: IDataServices,
    private readonly diceRound: DiceRoundService,
    private readonly betDice: BetDiceService,
  ) {}

  async listenRoundStart() {
    await this.factory.diceContract.on('StartRound', async (epoch: bigint) => {
      // Consts
      await this.diceRound.createNewRound(epoch);
    });
  }

  async listenRoundEnd() {
    await this.factory.diceContract.on('EndRound', async (epoch: bigint, dice1: bigint, dice2: bigint, dice3: bigint) => {
      // Update round
      await this.diceRound.updateEndRound(epoch, dice1, dice2, dice3);

      // Update Bet
      await this.betDice.updateBetWhenRoundIsEnded(epoch);
    });
  }

  async listenCutBetRound() {
    await this.factory.diceContract.on('CutBet', async (epoch: bigint, amount: bigint) => {
      const a = parseInt(amount.toString());
      const result = await this.db.diceRepo.upsertDocumentDataWithResult(epoch.toString(), {
        bearAmount: a,
        bullAmount: a,
        totalAmount: a * 2,
      });

      this.Logger.log(`Cut bet round ${epoch.toString()}, total bet ${a * 2} !`);
    });
  }
}
