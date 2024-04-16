import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { BetDiceService } from 'src/use-case/bet/dice/bet-dice.service';
import { DiceService } from 'src/use-case/games/dice/dice.service';
import { HelperService } from 'src/use-case/helper/helper.service';

@Injectable()
export class EventDiceBetListener implements OnApplicationBootstrap {
    private logger: ILogger;

    private boundHandleBetBear: (sender: string, epoch: bigint, amount: bigint) => Promise<void> =
        this.handleBetBear.bind(this);

    private boundHandleBetBull: (sender: string, epoch: bigint, amount: bigint) => Promise<void> =
        this.handleBetBull.bind(this);

    private boundHandleCutBetUser: (
        epoch: bigint,
        sender: string,
        betAmount: bigint,
        refundAmount: bigint,
    ) => Promise<void> = this.handleCutBetUser.bind(this);

    constructor(
        private readonly diceOperator: DiceService,
        private readonly betDice: BetDiceService,
        private readonly helper: HelperService,
        private readonly logFactory: ILoggerFactory,
    ) {}

    onApplicationBootstrap() {
        this.logger = this.logFactory.diceLogger;
        if (process.env.CONSTANT_ENABLE_DICE === 'True') {
            this.createEventBetListeners();
        }
    }

    // =========================
    // === Cronjob Functions ===
    // =========================

    /**
     * Cronjob to renew listeners every 1 minute.
     */
    // @Cron('*/1 * * * *')
    renewDiceListeners() {
        this.removeEventBetListeners();
        this.createEventBetListeners();
    }

    // ===============================
    // === Main Listener Functions ===
    // ===============================

    /**
     * Function to create all the listeners of dice events.
     */
    createEventBetListeners() {
        this.diceOperator.subcribeToEvent('BetBear', this.boundHandleBetBear);
        this.diceOperator.subcribeToEvent('BetBull', this.boundHandleBetBull);
        this.diceOperator.subcribeToEvent('CutBetUser', this.boundHandleCutBetUser);
    }

    removeEventBetListeners() {
        this.diceOperator.unSubcribeToEvent('BetBear', this.boundHandleBetBear);
        this.diceOperator.unSubcribeToEvent('BetBull', this.boundHandleBetBull);
        this.diceOperator.unSubcribeToEvent('CutBetUser', this.boundHandleCutBetUser);
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
