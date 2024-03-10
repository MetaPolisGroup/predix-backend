import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { Cron } from '@nestjs/schedule';
import { BetPredictionService } from 'src/use-case/bet/prediction/bet-prediction.service';
import { HelperService } from 'src/use-case/helper/helper.service';

@Injectable()
export class EventBetListener implements OnApplicationBootstrap {
  private logger: Logger;

  private readonly boundHandleEventBetBear = this.handleEventBetBear.bind(this);
  private readonly boundHandleEventBetBull = this.handleEventBetBull.bind(this);
  private readonly boundHandleEventUserCutBet = this.handleEventUserCutBet.bind(this);


  constructor(
    private readonly factory: ContractFactoryAbstract,
    private readonly betPrediction: BetPredictionService,
    private readonly helper: HelperService,
  ) {
    this.logger = new Logger(EventBetListener.name);
  }

  async onApplicationBootstrap() {
    if (process.env.CONSTANT_ENABLE === 'True') {
      await this.createOrRemoveEventBetListeners("on");
    }
  }

  // =========================
  // ======= Cronjobs =======
  // =========================

  /**
   * Cronjob to renew event listeners every minute.
   */
  // @Cron('*/1 * * * *')
  async renewBetListeners() {
    await this.createOrRemoveEventBetListeners("off");
    await this.createOrRemoveEventBetListeners("on");
  }

  // ===============================
  // === Main Listener Functions ===
  // ===============================

  /**
   * Function to create event listeners for Predix contract bet events.
   */
  async createOrRemoveEventBetListeners(type: "on" | "off") {
    await this.helper.createEventListener(this.factory.predictionContract, 'BetBear', type, this.boundHandleEventBetBear);

    await this.helper.createEventListener(
      this.factory.predictionContract,
      'BetBull',
      type,
      this.boundHandleEventBetBull,
    );

    await this.helper.createEventListener(this.factory.predictionContract, 'CutBetUser', type, this.boundHandleEventUserCutBet);
  }

  // ==============================
  // === Event Listener Methods ===
  // ==============================

  /**
   * Listen to the BetBear event.
   */
  async handleEventBetBear(sender: string, epoch: bigint, amount: bigint) {
    await this.betPrediction.userBetBear(sender, epoch, amount);
  }

  /**
   * Listen to the BetBull event.
   */
  async handleEventBetBull(sender: string, epoch: bigint, amount: bigint) {
    await this.betPrediction.userBetBull(sender, epoch, amount);
  }

  /**
   * Listen to the CutBetUser event.
   */
  async handleEventUserCutBet(epoch: bigint, sender: string, betAmount: bigint, refundAmount: bigint, totalBetRound?: bigint) {
    await this.betPrediction.userCutBet(epoch, sender, betAmount, refundAmount);
  }
}
