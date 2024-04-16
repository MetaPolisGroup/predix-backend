import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import constant from 'src/configuration';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { HelperService } from 'src/use-case/helper/helper.service';
import { PredixOperatorContract } from 'src/use-case/contracts/predix/prediction-operator.service';

@Injectable()
export class EventSetListener implements OnApplicationBootstrap {
    private logger: ILogger;

    private boundHandleNewIntervalSeconds: (intervalSeconds: bigint) => Promise<void> | void =
        this.handleNewIntervalSeconds.bind(this);

    private boundHandleNewTreasuryFee: (epoch: bigint, treasuryFee: bigint) => Promise<void> | void =
        this.handleNewTreasuryFee.bind(this);

    private boundHandlePause: (epoch: bigint) => Promise<void> | void = this.handlePause.bind(this);

    private boundHandleUnPause: (epoch: bigint) => Promise<void> | void = this.handleUnPause.bind(this);

    constructor(
        private readonly db: IDataServices,
        private readonly predixOperator: PredixOperatorContract,
        private readonly helper: HelperService,
        private readonly logFactory: ILoggerFactory,
    ) {
        this.logger = this.logFactory.predictionLogger;
    }

    onApplicationBootstrap() {
        if (process.env.CONSTANT_ENABLE === 'True') {
            this.createEventSetListeners();
        }
    }

    // ================
    // === Cronjobs ===
    // ================

    /**
     * Function renews event listeners every minute.
     */
    // @Cron('*/1 * * * *')
    renewEventSetListeners() {
        this.createEventSetListeners();
        this.removeEventSetListeners();
    }

    // ===============================
    // === Main Listener Functions ===
    // ===============================

    /**
     * Function creates event listeners for predix contract set events.
     */
    createEventSetListeners() {
        this.predixOperator.subcribeToEvent('NewIntervalSeconds', this.boundHandleNewIntervalSeconds);

        this.predixOperator.subcribeToEvent('NewTreasuryFee', this.boundHandleNewTreasuryFee);

        this.predixOperator.subcribeToEvent('Pause', this.boundHandlePause);

        this.predixOperator.subcribeToEvent('Unpause', this.boundHandleUnPause);
    }

    removeEventSetListeners() {
        this.predixOperator.unSubcribeToEvent('NewIntervalSeconds', this.boundHandleNewIntervalSeconds);
        this.predixOperator.unSubcribeToEvent('NewTreasuryFee', this.boundHandleNewTreasuryFee);
        this.predixOperator.unSubcribeToEvent('Pause', this.boundHandlePause);
        this.predixOperator.unSubcribeToEvent('Unpause', this.boundHandleUnPause);
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

        // await this.prediction.cancelCurrentRound();

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
