import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { AlchemyProvider, Contract, NonceManager, Provider, parseEther } from 'ethers';
import { ContractMultiWalletsAbstract } from 'src/core/abstract/contract-factory/contract-multiwallets.abstract';
import { ContractGeneric } from './contract-generic.framwork';

@Injectable()
export class ContractMultiWallets
    extends ContractGeneric
    implements ContractMultiWalletsAbstract, OnApplicationBootstrap
{
    private wallets: {
        [key: string]: {
            signer: NonceManager;
            contract: Contract;
            address: string;
            privateKey: string;
        };
    } = {};

    constructor(contractAddress: string, abi: string, privateKey: string, provider: Provider | AlchemyProvider) {
        super(contractAddress, abi, privateKey, provider);
    }

    async onApplicationBootstrap() {}

    async executeContractByPrivatekey(privateKey: string, functionName: string, ...agrs: string[]): Promise<string> {
        const { contract, signer } = await this.getWalletInstance(privateKey);

        // const { maxPriorityFeePerGas, maxFeePerGas } = await this.getFeeDataFromAlchemy();
        const { maxPriorityFeePerGas, maxFeePerGas } = await this.getFeeDataFromProvider();
        const gasLimit = await contract[functionName].estimateGas(...agrs);

        const nonce = await signer.getNonce('pending');

        const tx = await contract[functionName](...agrs, {
            gasLimit,
            nonce,
            maxFeePerGas,
            maxPriorityFeePerGas,
        });

        return tx.hash;
    }

    async sendTransactionByPrivateKey(privateKey: string, to: string, value: string): Promise<string> {
        const { signer } = await this.getWalletInstance(privateKey);
        const { hash } = await signer.sendTransaction({
            to,
            value: parseEther(value),
        });

        return hash;
    }

    private async getWalletInstance(privateKey: string) {
        if (this.wallets[privateKey]) {
            return this.wallets[privateKey];
        }

        const signer = this.getWallet(privateKey);
        const address = await signer.getAddress();
        const contract = this.contract.connect(signer) as Contract;
        this.wallets[privateKey] = {
            contract,
            signer,
            address,
            privateKey,
        };

        return this.wallets[privateKey];
    }
}
