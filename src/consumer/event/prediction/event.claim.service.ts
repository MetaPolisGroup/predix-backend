import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ethers } from 'ethers';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { CommissionService } from 'src/use-case/commission/commission.service';
import { PredixOperatorContract } from 'src/use-case/contracts/predix/prediction-operator.service';
import { HelperService } from 'src/use-case/helper/helper.service';
import { UserUsecaseService } from 'src/use-case/user/user.service';
import { animals } from 'unique-names-generator';

@Injectable()
export class EventClaimListener implements OnApplicationBootstrap {
    private logger: ILogger;

    private readonly boundHandleClaim: (sender: string, epoch: bigint, amount: bigint) => Promise<void> | void =
        this.handleClaim.bind(this);

    private readonly boundHandleCommissionClaim: (sender: string, amount: bigint) => Promise<void> | void =
        this.handleCommissionClaim.bind(this);

    constructor(
        private readonly db: IDataServices,
        private readonly userService: UserUsecaseService,
        private readonly helper: HelperService,
        private readonly commission: CommissionService,
        private readonly logFactory: ILoggerFactory,
        private readonly predixOperator: PredixOperatorContract,
    ) {
        this.logger = this.logFactory.predictionLogger;
    }

    /**
     * This method is executed when the application boots up.
     * It sets up event listeners if CONSTANT_ENABLE is set to 'True'.
     */
    onApplicationBootstrap() {
        if (process.env.CONSTANT_ENABLE === 'True') {
            this.createEventClaimListeners();
        }
    }

    // ================
    // === Cronjobs ===
    // ================

    /**
     * Function renews event listeners every minute.
     */
    // @Cron('*/1 * * * *')
    async renewEventClaimListeners() {
        // await this.createOrRemoveEventClaimListeners("off");
        // await this.createOrRemoveEventClaimListeners("on");
    }

    // ===============================
    // === Main Listener Functions ===
    // ===============================

    /**
     * Function creates event listeners for claim-related events.
     */
    createEventClaimListeners() {
        this.predixOperator.subcribeToEvent('Claim', this.boundHandleClaim);
        this.predixOperator.subcribeToEvent('CommissionClaim', this.boundHandleCommissionClaim);
    }

    removeEventClaimListeners() {
        this.predixOperator.unSubcribeToEvent('Claim', this.boundHandleClaim);
        this.predixOperator.unSubcribeToEvent('CommissionClaim', this.boundHandleCommissionClaim);
    }

    // ===============================
    // === Event Handler Functions ===
    // ===============================

    /**
     * Handles the Claim event.
     * @param sender The address of the user making the claim.
     * @param epoch The current round number.
     * @param amount The amount being claimed.
     */
    async handleClaim(sender: string, epoch: bigint, amount: bigint) {
        const bet = await this.db.betRepo.getFirstValueCollectionDataByConditions([
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

        await this.db.betRepo.upsertDocumentData(bet.id, {
            claimed: true,
            claim_amount: parseInt(this.helper.toEtherNumber(amount).toString()),
        });

        this.logger.log(`${sender} claim ${ethers.formatEther(amount)} !`);
    }

    /**
     * Handles the CommissionClaim event.
     * @param sender The address of the user making the claim.
     * @param amount The commission amount being claimed.
     */
    async handleCommissionClaim(sender: string, amount: bigint) {
        const commision = this.commission.commissionWithdraw(await this.userService.getUserByAddress(sender));
        this.commission.create(commision);
        this.userService.upsertUser(sender, { commission: 0 });
        this.logger.log(`${sender} claim ${ethers.formatEther(amount)} commision !`);
    }
}
