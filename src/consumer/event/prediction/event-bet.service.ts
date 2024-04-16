import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { BetPredictionService } from 'src/use-case/bet/prediction/bet-prediction.service';
import { HelperService } from 'src/use-case/helper/helper.service';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { PredixOperatorContract } from 'src/use-case/contracts/predix/prediction-operator.service';

@Injectable()
export class EventBetListener implements OnApplicationBootstrap {
    private logger: ILogger;

    private readonly boundHandleEventBetBear: (
        sender: string,
        epoch: bigint,
        amount: bigint,
        hash: string,
    ) => Promise<void> = this.handleEventBetBear.bind(this);

    private readonly boundHandleEventBetBull: (
        sender: string,
        epoch: bigint,
        amount: bigint,
        hash: string,
    ) => Promise<void> = this.handleEventBetBull.bind(this);

    private readonly boundHandleEventUserCutBet: (
        epoch: bigint,
        sender: string,
        betAmount: bigint,
        refundAmount: bigint,
        totalBetRound?: bigint,
    ) => Promise<void> = this.handleEventUserCutBet.bind(this);

    constructor(
        private readonly betPrediction: BetPredictionService,
        private readonly helper: HelperService,
        private readonly predixOperator: PredixOperatorContract,
        private readonly logFactory: ILoggerFactory,
    ) {}

    onApplicationBootstrap() {
        if (process.env.CONSTANT_ENABLE === 'True') {
            this.createEventBetListeners();
        }
    }

    // =========================
    // ======= Cronjobs =======
    // =========================

    /**
     * Cronjob to renew event listeners every minute.
     */
    // @Cron('*/1 * * * *')
    renewBetListeners() {
        this.createEventBetListeners();
        this.removeEventBetListeners();
    }

    // ===============================
    // === Main Listener Functions ===
    // ===============================

    /**
     * Function to create event listeners for Predix contract bet events.
     */
    createEventBetListeners() {
        this.predixOperator.subcribeToEvent('BetBear', this.boundHandleEventBetBear);
        this.predixOperator.subcribeToEvent('BetBull', this.boundHandleEventBetBull);
        this.predixOperator.subcribeToEvent('CutBetUser', this.boundHandleEventUserCutBet);
    }

    removeEventBetListeners() {
        this.predixOperator.unSubcribeToEvent('BetBear', this.boundHandleEventBetBear);
        this.predixOperator.unSubcribeToEvent('BetBull', this.boundHandleEventBetBull);
        this.predixOperator.unSubcribeToEvent('CutBetUser', this.boundHandleEventUserCutBet);
    }

    // ==============================
    // === Event Listener Methods ===
    // ==============================

    /**
     * Listen to the BetBear event.
     */
    async handleEventBetBear(sender: string, epoch: bigint, amount: bigint, hash: string) {
        await this.betPrediction.userBetBear(sender, Number(epoch), this.helper.toEtherNumber(amount), hash);
    }

    /**
     * Listen to the BetBull event.
     */
    async handleEventBetBull(sender: string, epoch: bigint, amount: bigint, hash: string) {
        await this.betPrediction.userBetBull(sender, Number(epoch), this.helper.toEtherNumber(amount), hash);
    }

    /**
     * Listen to the CutBetUser event.
     */
    async handleEventUserCutBet(
        epoch: bigint,
        sender: string,
        betAmount: bigint,
        refundAmount: bigint,
        totalBetRound?: bigint,
    ) {
        await this.betPrediction.userCutBet(
            Number(epoch),
            sender,
            this.helper.toEtherNumber(betAmount),
            this.helper.toEtherNumber(refundAmount),
        );
    }
}
