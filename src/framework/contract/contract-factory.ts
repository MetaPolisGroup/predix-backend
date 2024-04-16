/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { AlchemyProvider, ethers } from 'ethers';

import constant from 'src/configuration';
import { ChainType } from 'src/configuration/chain';
import { Chainlist } from 'src/configuration/chainlist';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { ContractGeneric } from './contract-generic.framwork';
import { ContractMultiWallets } from './contract-multiwallets.framework';

@Injectable()
export class ContractFactory implements ContractFactoryAbstract, OnApplicationBootstrap {
    //Predix

    readonly predictionContract: ContractGeneric;

    readonly predictionBotContract: ContractMultiWallets;

    readonly tokenContract: ContractMultiWallets;

    readonly aggregatorContract: ContractGeneric;

    readonly marketContract: ContractGeneric;

    readonly nftContract: ContractGeneric;

    readonly faucetContract: ContractMultiWallets;

    readonly diceContract: ContractGeneric;

    // Provider
    readonly provider: AlchemyProvider;

    constructor() {
        // Provider
        this.provider = this.getAlchemyProvider();

        // Prediction Contracts
        constant.ADDRESS.PREDICTION;
        this.predictionContract = new ContractGeneric(
            constant.ADDRESS.PREDICTION,
            constant.ABI.PREDICTION,
            process.env.PREDIX_OPERATOR_PRIVATEKEY,
            this.provider,
        );

        this.predictionBotContract = new ContractMultiWallets(
            constant.ADDRESS.PREDICTION,
            constant.ABI.PREDICTION,
            process.env.PREDIX_OPERATOR_PRIVATEKEY,
            this.provider,
        );

        // Dice Contract
        this.diceContract = new ContractGeneric(
            constant.ADDRESS.DICE,
            constant.ABI.DICE,
            process.env.DICE_OPERATOR_PRIVATEKEY,
            this.provider,
        );

        // Market Contract
        this.marketContract = new ContractGeneric(
            constant.ADDRESS.MARKET,
            constant.ABI.MARKET,
            process.env.MARKET_OPERATOR_PRIVATEKEY,
            this.provider,
        );

        // //NFT contract
        this.nftContract = new ContractGeneric(
            constant.ADDRESS.NFT,
            constant.ABI.NFT,
            process.env.PREDIX_OPERATOR_PRIVATEKEY,
            this.provider,
        );

        // Faucet Contract
        this.faucetContract = new ContractMultiWallets(
            constant.ADDRESS.FAUCET,
            constant.ABI.FAUCET,
            process.env.PREDIX_BOTS_OPERATOR_PRIVATEKEY,
            this.provider,
        );

        // Token Contract
        this.tokenContract = new ContractMultiWallets(
            constant.ADDRESS.TOKEN,
            constant.ABI.TOKEN,
            process.env.PREDIX_BOTS_OPERATOR_PRIVATEKEY,
            this.provider,
        );

        // Aggregator contract
        this.aggregatorContract = new ContractGeneric(
            constant.ADDRESS.AGGREGATOR,
            constant.ABI.AGGREGATOR,
            process.env.PREDIX_OPERATOR_PRIVATEKEY,
            this.getProvider(ChainType.BSC),
        );
    }

    async onApplicationBootstrap() {}

    getAlchemyProvider() {
        if (this.provider) {
            return this.provider;
        }
        const provider = new AlchemyProvider(
            {
                chainId: 84532,
                name: 'base-sepolia',
            },
            process.env.ALCHEMY_API_KEY,
        );
        return provider;
    }

    getProvider(chain: ChainType) {
        const provider = new ethers.JsonRpcProvider(Chainlist[chain].rpc, {
            chainId: Chainlist[chain].chainId,
            name: Chainlist[chain].name,
        });
        return provider;
    }
}
