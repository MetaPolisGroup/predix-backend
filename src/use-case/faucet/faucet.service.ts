import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { ContractMultiWalletsAbstract } from 'src/core/abstract/contract-factory/contract-multiwallets.abstract';
import { Wallet } from 'src/core/entity/wallet.entity';
import { PreTokenService } from '../token/pre-token/pre-token.service';
import constant from 'src/configuration';
import { NativeTokenService } from '../token/native-token/native-token.service';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';

@Injectable()
export class FaucetService implements OnApplicationBootstrap {
    private logger: ILogger;

    private contract: ContractMultiWalletsAbstract;

    private contractAddr: string;

    constructor(
        private readonly factory: ContractFactoryAbstract,
        private readonly preToken: PreTokenService,
        private readonly nativeToken: NativeTokenService,
        private readonly loggerFactory: ILoggerFactory,
    ) {
        this.logger = this.loggerFactory.predictionLogger;
        this.contract = this.factory.faucetContract;
    }

    async onApplicationBootstrap() {
        this.contractAddr = await this.contract.getContractAddress();
    }

    async drip(address: string) {
        const hash = await this.contract.executeContract('drip', address);
        const status = await this.contract.waitForTransaction(hash);

        return status;
    }

    async faucetEthByPrivateKeyAndWait(wallet: Wallet) {
        if (!(await this.nativeToken.isEnoughEth(this.contractAddr, constant.BOT.FAKEBOT.DEFAULT_ETH_BUDGET))) {
            this.logger.warn('Faucet contract ETH balance insufficient !');
            return;
        }

        const hash = await this.contract.executeContractByPrivatekey(wallet.privateKey, 'dripEth', wallet.address);
        await this.contract.waitForTransaction(hash);
    }

    async faucetTokenByPrivateKeyAndWait(wallet: Wallet) {
        if (!(await this.preToken.isEnoughToken(this.contractAddr, constant.BOT.FAKEBOT.DEFAULT_TOKEN_BUDGET))) {
            this.logger.error('Faucet contract PRE token balance insufficient!');
            return;
        }
        const hash = await this.contract.executeContractByPrivatekey(wallet.privateKey, 'dripToken', wallet.address);
        await this.contract.waitForTransaction(hash);
    }

    async addWhitelistAndWait(address: string[]) {
        const hash = await this.contract.executeContract('addWhiteLists', address);
        await this.contract.waitForTransaction(hash);
    }
}
