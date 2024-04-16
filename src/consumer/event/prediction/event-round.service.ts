import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { BetPredictionService } from 'src/use-case/bet/prediction/bet-prediction.service';
import { HelperService } from 'src/use-case/helper/helper.service';
import { PredictionRoundService } from 'src/use-case/games/prediction/prediction-round.service';
import { PredixOperatorContract } from 'src/use-case/contracts/predix/prediction-operator.service';
import { PredixStatisticService } from 'src/use-case/statistic/predix/predix-statistic.service';

@Injectable()
export class EventRoundListener implements OnApplicationBootstrap {
    private logger: ILogger;

    private readonly boundHandleStartRound: (epoch: bigint) => Promise<void> | void = this.handleStartRound.bind(this);

    private readonly boundHandleLockRound: (epoch: bigint, roundId: bigint, price: bigint) => Promise<void> | void =
        this.handleLockRound.bind(this);

    private readonly boundHandleEndRound: (epoch: bigint, roundId: bigint, price: bigint) => Promise<void> | void =
        this.handleEndRound.bind(this);

    private readonly boundHandleCutBet: (epoch: bigint, amount: bigint) => Promise<void> | void =
        this.handleCutBet.bind(this);

    constructor(
        private readonly db: IDataServices,
        private readonly predixRound: PredictionRoundService,
        private readonly betPrediction: BetPredictionService,
        private readonly predixStatistic: PredixStatisticService,
        private readonly helper: HelperService,
        private readonly predixOperator: PredixOperatorContract,
        private readonly logFactory: ILoggerFactory,
    ) {
        this.logger = this.logFactory.predictionLogger;
    }

    onApplicationBootstrap() {
        if (process.env.CONSTANT_ENABLE === 'True') {
            this.createRoundListeners();
        }
    }

    // =========================
    // ======= Cronjobs =======
    // =========================

    /**
     * Cronjob to renew event listeners every minute.
     */
    // @Cron('*/1 * * * *')
    renewPredixListeners() {
        this.removeRoundListeners();
        this.createRoundListeners();
    }

    // ===============================
    // === Main Listener Functions ===
    // ===============================

    /**
     * Function to create event listeners for round events.
     */
    createRoundListeners() {
        this.predixOperator.subcribeToEvent('StartRound', this.boundHandleStartRound);
        this.predixOperator.subcribeToEvent('LockRound', this.boundHandleLockRound);
        this.predixOperator.subcribeToEvent('EndRound', this.boundHandleEndRound);
        this.predixOperator.subcribeToEvent('CutBet', this.boundHandleCutBet);
    }

    /**
     * Function to remove event listeners for round events.
     */
    removeRoundListeners() {
        this.predixOperator.unSubcribeToEvent('StartRound', this.boundHandleStartRound);
        this.predixOperator.unSubcribeToEvent('LockRound', this.boundHandleLockRound);
        this.predixOperator.unSubcribeToEvent('EndRound', this.boundHandleEndRound);
        this.predixOperator.unSubcribeToEvent('CutBet', this.boundHandleCutBet);
    }

    // ==============================
    // === Event Handler Functions ===
    // ==============================

    /**
     * Handles the StartRound event.
     * @param epoch The epoch of the round.
     */
    async handleStartRound(epoch: bigint) {
        await this.predixRound.createNewRound(Number(epoch));
        this.logger.log(`Round ${epoch.toString()} has started !`);
    }

    /**
     * Handles the LockRound event.
     * @param epoch The epoch of the round.
     * @param roundId The ID of the round.
     * @param price The price of the round.
     */
    async handleLockRound(epoch: bigint, roundId: bigint, price: bigint) {
        await this.predixRound.updateLockRound(
            await this.predixRound.getRoundByEpoch(Number(epoch)),
            Number(roundId),
            this.helper.formatChainlinkPrice(price),
        );

        this.logger.log(`Round ${epoch.toString()} has locked !`);
    }

    /**
     * Handles the EndRound event.
     * @param epoch The epoch of the round.
     * @param roundId The ID of the round.
     * @param price The price of the round.
     */
    async handleEndRound(epoch: bigint, roundId: bigint, price: bigint) {
        await this.predixRound.updateEndRound(
            await this.predixRound.getRoundByEpoch(Number(epoch)),
            Number(roundId),
            this.helper.formatChainlinkPrice(price),
        );
        this.logger.log(`Round ${epoch.toString()} has ended !`);
    }

    /**
     * Handles the CutBet event.
     * @param epoch The epoch of the round.
     * @param amount The amount of the bet.
     */
    async handleCutBet(epoch: bigint, amount: bigint) {
        // const a = this.helper.toEtherNumber(amount);
        // await this.db.predictionRepo.upsertDocumentDataWithResult(epoch.toString(), {
        //     up_amount: a,
        //     down_amount: a,
        //     total_amount: a * 2,
        // });
        // this.logger.log(`Cut bet round ${epoch.toString()}, total bet ${a * 2} !`);
    }
}
