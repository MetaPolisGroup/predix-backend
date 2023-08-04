/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { PredictionRoundService } from '../prediction/prediction-round.service';
import { BetPredictionService } from '../bet/prediction/bet-prediction.service';

@Injectable()
export class EventRoundListener implements OnApplicationBootstrap {
  private Logger: Logger;

  async onApplicationBootstrap() {
    if (process.env.CONSTANT_ENABLE === 'True') {
      await this.listenRoundStart();
      await this.listenRoundLock();
      await this.listenRoundEnd();
      await this.listenCutBetRound();
    }
    this.Logger = new Logger(EventRoundListener.name);
  }

  constructor(
    private readonly factory: ContractFactoryAbstract,
    private readonly db: IDataServices,
    private readonly predictionRound: PredictionRoundService,
    private readonly betPrediction: BetPredictionService,
  ) {}

  async listenRoundStart() {
    await this.factory.predictionContract.on('StartRound', async (epoch: bigint) => {
      // Consts
      await this.predictionRound.createNewRound(epoch);
    });
  }

  async listenRoundLock() {
    await this.factory.predictionContract.on('LockRound', async (epoch: bigint, roundId: bigint, price: bigint) => {
      // Update round lock
      await this.predictionRound.updateLockRound(epoch, roundId, price);

      // Update bets
      await this.betPrediction.updateBetWhenRoundIsLocked(epoch);
    });
  }

  async listenRoundEnd() {
    await this.factory.predictionContract.on('EndRound', async (epoch: bigint, roundId: bigint, price: bigint) => {
      // Update round
      await this.predictionRound.updateEndRound(epoch, roundId, price);

      // Update Bet
      await this.betPrediction.updateBetWhenRoundIsEnded(epoch);
    });
  }

  async listenCutBetRound() {
    await this.factory.predictionContract.on('CutBet', async (epoch: bigint, amount: bigint) => {
      await this.db.predictionRepo.upsertDocumentData(epoch.toString(), {
        bearAmount: parseInt(amount.toString()),
        bullAmount: parseInt(amount.toString()),
        totalAmount: parseInt(amount.toString()) * 2,
      });

      this.Logger.log(`Cut bet round ${epoch.toString()}, total bet ${parseInt(amount.toString()) * 2} !`);
    });
  }
}
