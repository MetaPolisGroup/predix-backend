import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { formatEther } from 'ethers';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { HelperService } from 'src/use-case/helper/helper.service';

@Injectable()
export class EventDiceClaimListener implements OnApplicationBootstrap {
  private logger: Logger;

  private readonly boundHandleClaim = this.handleClaim.bind(this);


  constructor(
    private readonly factory: ContractFactoryAbstract,
    private readonly db: IDataServices,
    private readonly helper: HelperService,
  ) {
    this.logger = new Logger(EventDiceClaimListener.name);
  }

  /**
   * This method is executed when the application boots up.
   * It sets up the Claim event listener if CONSTANT_ENABLE_DICE is set to 'True'.
   */
  async onApplicationBootstrap() {
    if (process.env.CONSTANT_ENABLE_DICE === 'True') {
      await this.createOrRemoveDiceClaimListeners("on");
    }
  }

  // @Cron('*/1 * * * *')
  async renewClaimListener() {
    await this.createOrRemoveDiceClaimListeners("off");
    await this.createOrRemoveDiceClaimListeners("on");
  }

  /**
   * Sets up the event listener for the Claim event emitted by the Dice contract.
   */
  async createOrRemoveDiceClaimListeners(type: "on" | "off") {
    await this.helper.createEventListener(
      this.factory.diceContract,
      'Claim',
      type,
      this.boundHandleClaim,
    );
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

    await this.db.betDiceRepo.upsertDocumentData(bet.id, { claimed: true, claimed_amount: parseInt(amount.toString()) });

    this.logger.log(`${sender} claimed ${formatEther(amount)}!`);
  }
}
