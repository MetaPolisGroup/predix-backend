import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { BetDiceService } from 'src/use-case/bet/dice/bet-dice.service';
import { HelperService } from 'src/use-case/helper/helper.service';

@Injectable()
export class EventDiceBetListener implements OnApplicationBootstrap {
  private logger: ILogger;

  private readonly boundHandleBetBear = this.handleBetBear.bind(this);
  private readonly boundHandleBetBull = this.handleBetBull.bind(this);
  private readonly boundHandleCutBetUser = this.handleCutBetUser.bind(this);

  constructor(
    private readonly factory: ContractFactoryAbstract,
    private readonly betDice: BetDiceService,
    private readonly helper: HelperService,
    private readonly logFactory: ILoggerFactory,
  ) { }

  async onApplicationBootstrap() {
    this.logger = this.logFactory.diceLogger
    if (process.env.CONSTANT_ENABLE_DICE === 'True') {
      await this.createOrRemoveDiceListeners("on");
    }
  }

  // =========================
  // === Cronjob Functions ===
  // =========================

  /**
   * Cronjob to renew listeners every 1 minute.
   */
  // @Cron('*/1 * * * *')
  async renewDiceListeners() {
    await this.createOrRemoveDiceListeners("off");
    await this.createOrRemoveDiceListeners("on");
  }

  // ===============================
  // === Main Listener Functions ===
  // ===============================

  /**
   * Function to create all the listeners of dice events.
   */
  async createOrRemoveDiceListeners(type: "on" | "off") {
    /**
     * Create Listener on BetBear Event
     */
    await this.helper.createEventListener(
      this.factory.diceContract,
      'BetBear',
      type,
      this.boundHandleBetBear
    );

    /**
     * Create Listener on BetBull Event
     */
    await this.helper.createEventListener(
      this.factory.diceContract,
      'BetBull',
      type,
      this.boundHandleBetBull,
    );

    /**
     * Create Listener on CutBetUser Event
     */
    await this.helper.createEventListener(
      this.factory.diceContract,
      'CutBetUser',
      type,
      this.boundHandleCutBetUser,
    );
  }



  // ========================================
  // === Event Listener Handler Functions ===
  // ========================================

  /**
   * Handler function for BetBear event.
   * @param sender : Address of user.
   * @param epoch : The round number.
   * @param amount : Bet amount.
   */

  private async handleBetBear(sender: string, epoch: bigint, amount: bigint) {
    await this.betDice.userBetBear(sender, epoch, amount);
  }

  /**
   * Handler function for BetBull event.
   * @param sender : Address of user.
   * @param epoch : The round number.
   * @param amount : Bet amount.
   */
  private async handleBetBull(sender: string, epoch: bigint, amount: bigint) {
    await this.betDice.userBetBull(sender, epoch, amount);
  }

  /**
   * Handler function for CutBetUser event.
   * @param epoch : The round number.
   * @param sender : Address of user.
   * @param betAmount : Bet amount.
   * @param refundAmount : Refund amount.
   */
  private async handleCutBetUser(epoch: bigint, sender: string, betAmount: bigint, refundAmount: bigint) {
    await this.betDice.userCutBet(epoch, sender, betAmount, refundAmount);
  }
}
