import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import constant from 'src/configuration';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { DiceRoundService } from 'src/use-case/games/dice/dice-round.service';
import { DiceService } from 'src/use-case/games/dice/dice.service';
import { HelperService } from 'src/use-case/helper/helper.service';

@Injectable()
export class EventDiceSetListener implements OnApplicationBootstrap {
    private logger: ILogger;

    private boundHandlePause: (epoch: bigint) => Promise<void> = this.handlePause.bind(this);

    private boundHandleUnPause: (epoch: bigint) => Promise<void> = this.handleUnPause.bind(this);

    private boundHandleSetFee: (epoch: bigint, treasuryFee: bigint) => Promise<void> = this.handleSetFee.bind(this);

    private boundHandleIntervalSeconds: (intervalSeconds: bigint) => Promise<void> =
        this.handleSetIntervalSeconds.bind(this);

    constructor(
        private readonly db: IDataServices,
        private readonly diceOperator: DiceService,
        private readonly diceRound: DiceRoundService,
        private readonly helper: HelperService,
        private readonly logFactory: ILoggerFactory,
    ) {
        this.logger = this.logFactory.diceLogger;
    }

    /**
     * This method is executed when the application boots up.
     * It sets up event listeners if CONSTANT_ENABLE_DICE is set to 'True'.
     */
    onApplicationBootstrap() {
        if (process.env.CONSTANT_ENABLE_DICE === 'True') {
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
    renewDiceSetListeners() {
        this.removeEventSetListeners();
        this.createEventSetListeners();
    }

    // ===============================
    // === Main Listener Functions ===
    // ===============================

    /**
     * Function creates event listeners for dice contract events.
     */
    createEventSetListeners() {
        this.diceOperator.subcribeToEvent('NewIntervalSeconds', this.boundHandleIntervalSeconds);
        this.diceOperator.subcribeToEvent('NewTreasuryFee', this.boundHandleSetFee);
        this.diceOperator.subcribeToEvent('Pause', this.boundHandlePause);
        this.diceOperator.subcribeToEvent('Unpause', this.boundHandleUnPause);
    }

    removeEventSetListeners() {
        this.diceOperator.unSubcribeToEvent('NewIntervalSeconds', this.boundHandleIntervalSeconds);
        this.diceOperator.unSubcribeToEvent('NewTreasuryFee', this.boundHandleSetFee);
        this.diceOperator.unSubcribeToEvent('Pause', this.boundHandlePause);
        this.diceOperator.unSubcribeToEvent('Unpause', this.boundHandleUnPause);
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
        await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.DICE, {
            paused: true,
        });
        await this.diceRound.cancelCurrentRound();
    }

    /**
     * Handles the Unpause event.
     * @param epoch The current round number.
     */
    private async handleUnPause(epoch: bigint) {
        await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.DICE, {
            paused: false,
            genesis_start: false,
        });
        // await this.dice.genesisStartRound();
    }
}
