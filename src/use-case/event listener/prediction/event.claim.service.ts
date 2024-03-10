import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ethers } from 'ethers';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { HelperService } from 'src/use-case/helper/helper.service';

@Injectable()
export class EventClaimListener implements OnApplicationBootstrap {
  private logger: Logger;

  private readonly boundHandleClaim = this.handleClaim.bind(this);
  private readonly boundHandleCommissionClaim = this.handleCommissionClaim.bind(this);


  constructor(
    private readonly factory: ContractFactoryAbstract,
    private readonly db: IDataServices,
    private readonly helper: HelperService,
  ) {
    this.logger = new Logger(EventClaimListener.name);
  }

  /**
   * This method is executed when the application boots up.
   * It sets up event listeners if CONSTANT_ENABLE is set to 'True'.
   */
  async onApplicationBootstrap() {
    if (process.env.CONSTANT_ENABLE === 'True') {
      await this.createOrRemoveEventClaimListeners("on");
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
    await this.createOrRemoveEventClaimListeners("off");
    await this.createOrRemoveEventClaimListeners("on");
  }

  // ===============================
  // === Main Listener Functions ===
  // ===============================

  /**
   * Function creates event listeners for claim-related events.
   */
  async createOrRemoveEventClaimListeners(type: "on" | "off") {
    await this.helper.createEventListener(
      this.factory.predictionContract,
      'Claim',
      type,
      this.boundHandleClaim,
    );

    await this.helper.createEventListener(
      this.factory.predictionContract,
      'CommissionClaim',
      type,
      this.boundHandleCommissionClaim,
    );
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

    await this.db.betRepo.upsertDocumentData(bet.id, { claimed: true, claimed_amount: parseInt(amount.toString()) });

    this.logger.log(`${sender} claim ${ethers.formatEther(amount)} !`);
  }

  /**
   * Handles the CommissionClaim event.
   * @param sender The address of the user making the claim.
   * @param amount The commission amount being claimed.
   */
  async handleCommissionClaim(sender: string, amount: bigint) {
    await this.db.userRepo.upsertDocumentData(sender, { point: 0 });

    this.logger.log(`${sender} claim ${ethers.formatEther(amount)} commision !`);
  }
}
