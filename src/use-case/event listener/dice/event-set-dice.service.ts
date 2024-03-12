import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import constant from 'src/configuration';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { DiceService } from 'src/use-case/dice/dice.service';
import { HelperService } from 'src/use-case/helper/helper.service';

@Injectable()
export class EventDiceSetListener implements OnApplicationBootstrap {
  private logger: ILogger;

  private readonly boundHandlePause = this.handlePause.bind(this);
  private readonly boundHandleUnPause = this.handleUnPause.bind(this);
  private readonly boundHandleSetFee = this.handleSetFee.bind(this);
  private readonly boundHandleIntervalSeconds = this.handleSetIntervalSeconds.bind(this);

  constructor(
    private readonly factory: ContractFactoryAbstract,
    private readonly db: IDataServices,
    private readonly dice: DiceService,
    private readonly helper: HelperService,
    private readonly logFactory: ILoggerFactory
  ) {
    this.logger = this.logFactory.diceLogger
  }

  /**
   * This method is executed when the application boots up.
   * It sets up event listeners if CONSTANT_ENABLE_DICE is set to 'True'.
   */
  async onApplicationBootstrap() {
    if (process.env.CONSTANT_ENABLE_DICE === 'True') {
      await this.createOrRemoveDiceSetListeners("on");
    }
  }

  // ================
  // === Cronjobs ===
  // ================

  /**
   * Function renews event listeners every minute.
   */
  // @Cron('*/1 * * * *')
  async renewDiceSetListeners() {
    await this.createOrRemoveDiceSetListeners("off");
    await this.createOrRemoveDiceSetListeners("on");
  }

  // ===============================
  // === Main Listener Functions ===
  // ===============================

  /**
   * Function creates event listeners for dice contract events.
   */
  async createOrRemoveDiceSetListeners(type: "on" | "off") {
    /**
     *  Creates event listener for NewIntervalSeconds Event.
     */
    await this.helper.createEventListener(this.factory.diceContract, 'NewIntervalSeconds', type, this.boundHandleIntervalSeconds);

    /**
     *  Creates event listener for NewTreasuryFee Event.
     */
    await this.helper.createEventListener(this.factory.diceContract, 'NewTreasuryFee', type, this.boundHandleSetFee);

    /**
     *  Creates event listener for Pause Event.
     */
    await this.helper.createEventListener(this.factory.diceContract, 'Pause', type, this.boundHandlePause);

    /**
     *  Creates event listener for Unpause Event.
     */
    await this.helper.createEventListener(this.factory.diceContract, 'Unpause', type, this.boundHandleUnPause);
  }



  // ================
  // === Event Handler Functions ===
  // ================

  /**
   * Handles the NewIntervalSeconds event.
   * @param intervalSeconds : The new interval in seconds.
   */
  private async handleSetIntervalSeconds(intervalSeconds: bigint) {
    try {
      await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.DICE, {
        interval_seconds: parseInt(intervalSeconds.toString()),
      });
    } catch (error) {
      console.error('Error handling dice set interval:', error);
    }
  }

  /**
   * Handles the NewTreasuryFee event.
   * @param epoch The current round number.
   * @param treasuryFee The new treasury fee.
   */
  private async handleSetFee(epoch: bigint, treasuryFee: bigint) {
    try {
      await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.DICE, {
        fee: parseInt(treasuryFee.toString()),
      });
    } catch (error) {
      console.error('Error handling dice set fee:', error);
    }
  }

  /**
   * Handles the Pause event.
   * @param epoch The current round number.
   */
  private async handlePause(epoch: bigint) {
    try {
      await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.DICE, {
        paused: true,
      });
      await this.dice.cancelCurrentRound();
    } catch (error) {
      console.error('Error handling dice pause:', error);
    }
  }

  /**
   * Handles the Unpause event.
   * @param epoch The current round number.
   */
  private async handleUnPause(epoch: bigint) {
    try {
      await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.DICE, {
        paused: false,
        genesis_start: false,
      });
      // await this.dice.genesisStartRound();
    } catch (error) {
      console.error('Error handling dice unpause:', error);
    }
  }
}
