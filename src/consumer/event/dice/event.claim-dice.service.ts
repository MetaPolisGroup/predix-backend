import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { formatEther } from 'ethers';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { DiceService } from 'src/use-case/games/dice/dice.service';
import { HelperService } from 'src/use-case/helper/helper.service';

@Injectable()
export class EventDiceClaimListener implements OnApplicationBootstrap {
    private logger: ILogger;

    private readonly boundHandleClaim: (sender: string, epoch: bigint, amount: bigint) => Promise<void> =
        this.handleClaim.bind(this);

    constructor(
        private readonly diceOperator: DiceService,
        private readonly db: IDataServices,
        private readonly helper: HelperService,
        private readonly logFactory: ILoggerFactory,
    ) {
        this.logger = this.logFactory.diceLogger;
    }

    /**
     * This method is executed when the application boots up.
     * It sets up the Claim event listener if CONSTANT_ENABLE_DICE is set to 'True'.
     */
    onApplicationBootstrap() {
        if (process.env.CONSTANT_ENABLE_DICE === 'True') {
            this.createClaimListeners();
        }
    }

    // @Cron('*/1 * * * *')
    renewClaimListener() {
        this.removeClaimListeners();
        this.createClaimListeners();
    }

    /**
     * Sets up the event listener for the Claim event emitted by the Dice contract.
     */
    createClaimListeners() {
        this.diceOperator.subcribeToEvent('Claim', this.boundHandleClaim);
    }

    removeClaimListeners() {
        this.diceOperator.subcribeToEvent('Claim', this.boundHandleClaim);
    }

    /**
     * Handles the Claim event by updating the corresponding bet in the database.
     * @param sender The address of the user claiming the amount.
     * @param epoch The round number that they claim.
     * @param amount The claimed amount.
     */
    private async handleClaim(sender: string, epoch: bigint, amount: bigint) {
        const bet = await this.db.betDiceRepo.getFirstValueCollectionDataByConditions([
            {
                field: 'epoch',
                operator: '==',
                value: parseInt(epoch.toString()),
            },
            {
                field: 'user_address',
                operator: '==',
                value: sender,
            },
        ]);

        await this.db.betDiceRepo.upsertDocumentData(bet.id, {
            claimed: true,
            claimed_amount: parseInt(amount.toString()),
        });

        this.logger.log(`${sender} claimed ${formatEther(amount)}!`);
    }
}
