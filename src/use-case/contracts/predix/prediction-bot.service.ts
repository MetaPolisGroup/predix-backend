import { Injectable } from '@nestjs/common';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { ContractMultiWalletsAbstract } from 'src/core/abstract/contract-factory/contract-multiwallets.abstract';
import { Wallet } from 'src/core/entity/wallet.entity';
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

    async safeBetBullByPrivatekey(wallet: Wallet, epoch: number, amount: number) {
        if (!(await this.isUserBetable(wallet.address, epoch))) return;
        return this._betBullByPrivatekey(wallet.privateKey, epoch, amount);
    }

    async safeBetBearByPrivatekey(wallet: Wallet, epoch: number, amount: number) {
        if (!(await this.isUserBetable(wallet.address, epoch))) return;
        return this._betBearByPrivatekey(wallet.privateKey, epoch, amount);
    }

    private async _betBullByPrivatekey(privateKey: string, epoch: number, amount: number) {
        return this.contract.executeContractByPrivatekey(
            privateKey,
            'betBull',
            epoch.toString(),
            this.helper.toWei(amount),
        );
    }

    private async _betBearByPrivatekey(privateKey: string, epoch: number, amount: number) {
        return this.contract.executeContractByPrivatekey(
            privateKey,
            'betBear',
            epoch.toString(),
            this.helper.toWei(amount),
        );
    }

    async isUserBetable(address: string, epoch: number) {
        const bet = await this.contract.readContract('ledger', epoch.toString(), address);

        return !bet[1] && !bet[2];
    }
}
