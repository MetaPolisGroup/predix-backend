import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import constant from 'src/configuration';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { HelperService } from 'src/use-case/helper/helper.service';
import { PredictionService } from 'src/use-case/prediction/prediction.service';

@Injectable()
export class EventSetListener implements OnApplicationBootstrap {
  private logger: ILogger;

  private readonly boundHandleNewIntervalSeconds = this.handleNewIntervalSeconds.bind(this);
  private readonly boundHandleNewTreasuryFee = this.handleNewTreasuryFee.bind(this);
  private readonly boundHandlePause = this.handlePause.bind(this);
  private readonly boundHandleUnPause = this.handleUnPause.bind(this);


  constructor(
    private readonly factory: ContractFactoryAbstract,
    private readonly db: IDataServices,
    private readonly prediction: PredictionService,
    private readonly helper: HelperService,
    private readonly logFactory: ILoggerFactory
  ) {
    this.logger = this.logFactory.predictionLogger
  }

  async onApplicationBootstrap() {
    if (process.env.CONSTANT_ENABLE === 'True') {
      await this.createOrRemoveEventSetListeners("on");
    }
  }

  // ================
  // === Cronjobs ===
  // ================

  /**
   * Function renews event listeners every minute.
   */
  // @Cron('*/1 * * * *')
  async renewEventSetListeners() {
    await this.createOrRemoveEventSetListeners("off");
    await this.createOrRemoveEventSetListeners("on");
  }

  // ===============================
  // === Main Listener Functions ===
  // ===============================

  /**
   * Function creates event listeners for predix contract set events.
   */
  async createOrRemoveEventSetListeners(type: "on" | "off") {
    await this.helper.createEventListener(this.factory.predictionContract, 'NewIntervalSeconds', type, this.boundHandleNewIntervalSeconds);

    await this.helper.createEventListener(
      this.factory.predictionContract,
      'NewTreasuryFee',
      type,
      this.boundHandleNewTreasuryFee,
    );

    await this.helper.createEventListener(this.factory.predictionContract, 'Pause', type, this.boundHandlePause);

    await this.helper.createEventListener(this.factory.predictionContract, 'Unpause', type, this.boundHandleUnPause);
  }



  // ================
  // === Event Handler Functions ===
  // ================

  /**
   * Handles the NewIntervalSeconds event.
   * @param intervalSeconds : The new interval in seconds.
   */

  async handleNewIntervalSeconds(intervalSeconds: bigint) {
    await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.PREDICTION, {
      interval_seconds: parseInt(intervalSeconds.toString()),
    });
  }

  /**
   * Handles the NewTreasuryFee event.
   * @param epoch The current round number.
   * @param treasuryFee The new treasury fee.
   */
  async handleNewTreasuryFee(epoch: bigint, treasuryFee: bigint) {
    await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.PREDICTION, {
      fee: parseInt(treasuryFee.toString()),
    });
  }

  /**
   * Handles the NewTreasuryFee event.
   * @param epoch The current round number.
   */
  async handlePause(epoch: bigint) {
    await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.PREDICTION, {
      paused: true,
    });

    await this.prediction.cancelCurrentRound();

    this.logger.log('Predix contract has paused !');
  }

  /**
   * Handles the NewTreasuryFee event.
   * @param epoch The current round number.
   */

  async handleUnPause(epoch: bigint) {
    await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.PREDICTION, {
      paused: false,
      genesis_start: false,
      genesis_lock: false,
    });

    // await this.prediction.genesisStartRound();

    this.logger.log('Predix contract has unpaused !');
  }
}
