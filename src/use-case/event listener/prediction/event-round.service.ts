import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { BetPredictionService } from 'src/use-case/bet/prediction/bet-prediction.service';
import { HelperService } from 'src/use-case/helper/helper.service';
import { PredictionRoundService } from 'src/use-case/prediction/prediction-round.service';

@Injectable()
export class EventRoundListener implements OnApplicationBootstrap {
  private logger: Logger;


  private readonly boundHandleStartRound = this.handleStartRound.bind(this);
  private readonly boundHandleLockRound = this.handleLockRound.bind(this);
  private readonly boundHandleEndRound = this.handleEndRound.bind(this);
  private readonly boundHandleCutBet = this.handleCutBet.bind(this);


  constructor(
    private readonly factory: ContractFactoryAbstract,
    private readonly db: IDataServices,
    private readonly predictionRound: PredictionRoundService,
    private readonly betPrediction: BetPredictionService,
    private readonly helper: HelperService,
  ) {
    this.logger = new Logger(EventRoundListener.name);
  }

  async onApplicationBootstrap() {
    if (process.env.CONSTANT_ENABLE === 'True') {
      await this.createOrRemovePredixListeners("on");
    }
  }

  // =========================
  // ======= Cronjobs =======
  // =========================

  /**
   * Cronjob to renew event listeners every minute.
   */
  // @Cron('*/1 * * * *')
  async renewPredixListeners() {
    await this.createOrRemovePredixListeners("off");
    await this.createOrRemovePredixListeners("on");
  }

  // ===============================
  // === Main Listener Functions ===
  // ===============================

  /**
   * Function to create event listeners for Predix contract events.
   */
  async createOrRemovePredixListeners(type: "on" | "off") {
    await this.helper.createEventListener(this.factory.predictionContract, 'StartRound', type, this.boundHandleStartRound);

    await this.helper.createEventListener(
      this.factory.predictionContract,
      'LockRound',
      type,
      this.boundHandleLockRound,
    );

    await this.helper.createEventListener(
      this.factory.predictionContract,
      'EndRound',
      type,
      this.boundHandleEndRound,
    );

    await this.helper.createEventListener(this.factory.predictionContract, 'CutBet', type, this.boundHandleCutBet);
  }


  // ==============================
  // === Event Handler Functions ===
  // ==============================

  /**
   * Handles the StartRound event.
   * @param epoch The epoch of the round.
   */
  async handleStartRound(epoch: bigint) {
    await this.predictionRound.createNewRound(epoch);
  }

  /**
   * Handles the LockRound event.
   * @param epoch The epoch of the round.
   * @param roundId The ID of the round.
   * @param price The price of the round.
   */
  async handleLockRound(epoch: bigint, roundId: bigint, price: bigint) {
    await this.predictionRound.updateLockRound(epoch, roundId, price);
    await this.betPrediction.updateBetWhenRoundIsLocked(epoch);
    this.logger.log(`Round ${epoch.toString()} has locked !`);
  }

  /**
   * Handles the EndRound event.
   * @param epoch The epoch of the round.
   * @param roundId The ID of the round.
   * @param price The price of the round.
   */
  async handleEndRound(epoch: bigint, roundId: bigint, price: bigint) {
    await this.predictionRound.updateEndRound(epoch, roundId, price);
    await this.betPrediction.updateBetWhenRoundIsEnded(epoch);
    this.logger.log(`Round ${epoch.toString()} has ended !`);
  }

  /**
   * Handles the CutBet event.
   * @param epoch The epoch of the round.
   * @param amount The amount of the bet.
   */
  async handleCutBet(epoch: bigint, amount: bigint) {
    const a = parseInt(amount.toString());
    const result = await this.db.predictionRepo.upsertDocumentDataWithResult(epoch.toString(), {
      bearAmount: a,
      bullAmount: a,
      totalAmount: a * 2,
    });
    this.logger.log(`Cut bet round ${epoch.toString()}, total bet ${a * 2} !`);
  }
}
