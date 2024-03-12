/* eslint-disable no-unused-vars */
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { BetDiceService } from 'src/use-case/bet/dice/bet-dice.service';
import { DiceRoundService } from 'src/use-case/dice/dice-round.service';
import { HelperService } from 'src/use-case/helper/helper.service';

@Injectable()
export class EventDiceRoundListener implements OnApplicationBootstrap {
  private logger: ILogger;

  private readonly boundHandleStartRound = this.handleStartRound.bind(this);
  private readonly boundHandleEndRound = this.handleEndRound.bind(this);
  private readonly boundHandleCutBet = this.handleCutBet.bind(this);

  constructor(
    private readonly factory: ContractFactoryAbstract,
    private readonly db: IDataServices,
    private readonly diceRound: DiceRoundService,
    private readonly betDice: BetDiceService,
    private readonly helper: HelperService,
    private readonly logFactory: ILoggerFactory
  ) {

    this.logger = this.logFactory.diceLogger
  }

  /**
   * Function is executed when the application boots up.
   */
  async onApplicationBootstrap() {
    if (process.env.CONSTANT_ENABLE_DICE === 'True') {
      await this.createOrRemoveDiceListeners("on");
    }
  }

  // ================
  // === Cronjobs ===
  // ================

  /**
   * Function renews event listeners every minute.
   */
  // @Cron('*/2 * * * *')
  async renewDiceListeners() {

    await this.createOrRemoveDiceListeners("off");
    await this.createOrRemoveDiceListeners("on");

  }

  // ===============================
  // === Main Listener Functions ===
  // ===============================

  /**
   * Function creates event listeners for dice contract events.
   */
  async createOrRemoveDiceListeners(type: "on" | "off") {
    /**
     *  Creates event listener for StartRound Event.
     */
    await this.helper.createEventListener(this.factory.diceContract, 'StartRound', type, this.boundHandleStartRound);

    /**
     *  Creates event listener for EndRound Event.
     */
    await this.helper.createEventListener(
      this.factory.diceContract,
      'EndRound',
      type,
      this.boundHandleEndRound,
    );

    /**
     *  Creates event listener for CutBet Event.
     */
    await this.helper.createEventListener(this.factory.diceContract, 'CutBet', type, this.boundHandleCutBet);
  }



  // ========================================
  // === Event Listener Handler Functions ===
  // ========================================

  /**
   * Handles the StartRound event.
   * @param epoch : The round number.
   */
  private async handleStartRound(epoch: bigint) {
    await this.diceRound.createNewRound(epoch);
    this.logger.log(`Round ${epoch.toString()} has started !`);
  }

  /**
   * Handles the EndRound event.
   * @param epoch : The round number.
   * @param dice1 : value of dice 1 (1-6).
   * @param dice2 : value of dice 2 (1-6).
   * @param dice3 : value of dice 3 (1-6).
   */
  private async handleEndRound(epoch: bigint, dice1: bigint, dice2: bigint, dice3: bigint) {
    await this.diceRound.updateEndRound(epoch, dice1, dice2, dice3);
    await this.betDice.updateBetWhenRoundIsEnded(epoch);
    this.logger.log(`Round ${epoch.toString()} has ended !`);
  }

  /**
   * Handles the CutBet event.
   * @param amount : The bet amount for each side (bull & bear).
   */
  private async handleCutBet(epoch: bigint, amount: bigint) {
    const a = parseInt(amount.toString());
    await this.db.diceRepo.upsertDocumentDataWithResult(epoch.toString(), {
      bearAmount: a,
      bullAmount: a,
      totalAmount: a * 2,
    });
    this.logger.log(`Cut bet round ${epoch.toString()}, total bet ${a * 2} !`);
  }
}
