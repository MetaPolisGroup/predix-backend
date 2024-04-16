import { Injectable } from '@nestjs/common';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { ContractMultiWalletsAbstract } from 'src/core/abstract/contract-factory/contract-multiwallets.abstract';
import { HelperService } from 'src/use-case/helper/helper.service';

@Injectable()
export class PredixBotContract {
    private readonly contract: ContractMultiWalletsAbstract;

    constructor(
        private readonly helper: HelperService,
        private readonly factory: ContractFactoryAbstract,
    ) {
        this.contract = this.factory.predictionBotContract;
    }

    async betBullByPrivatekey(privateKey: string, epoch: number, amount: number) {
        return this.contract.executeContractByPrivatekey(
            privateKey,
            'betBull',
            epoch.toString(),
            this.helper.toWei(amount),
        );
    }

    async betBearByPrivatekey(privateKey: string, epoch: number, amount: number) {
        return this.contract.executeContractByPrivatekey(
            privateKey,
            'betBear',
            epoch.toString(),
            this.helper.toWei(amount),
        );
    }
}
