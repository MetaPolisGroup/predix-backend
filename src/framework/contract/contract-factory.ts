import { Injectable } from '@nestjs/common';
import { Contract, JsonRpcProvider, ethers } from 'ethers';
import constant from 'src/configuration';
import { providerRPC } from 'src/configuration/provider';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';

@Injectable()
export class ContractFactory implements ContractFactoryAbstract {
  //Firestore

  readonly predictionContract: Contract;

  readonly tokenContract: Contract;

  readonly aggregatorContract: Contract;

  readonly provider: JsonRpcProvider;

  readonly marketContract: Contract;

  readonly nftContract: Contract;

  readonly diceContract: Contract;

  constructor() {
    // Provider
    this.provider = constant.PROVIDER;

    // Prediction Contract
    this.predictionContract = this.getPredictionContract();

    // Token Contract
    this.tokenContract = this.getTokenContract();

    // Market Contract
    this.marketContract = this.getMarketContract();

    // Dice Contract
    this.diceContract = this.getDiceContract();

    // Aggregator contract
    this.aggregatorContract = this.getAggregatorContract();

    //Nft contract
    this.nftContract = this.getNftContract();

    if (!this.provider) {
      throw new Error('Provider not found !');
    }

    if (!this.tokenContract) {
      throw new Error('Prediction contract create failed !');
    }

    if (!this.marketContract) {
      throw new Error('Prediction contract create failed !');
    }

    if (!this.diceContract) {
      throw new Error('Dice contract create failed !');
    }

    if (!this.predictionContract) {
      throw new Error('Prediction contract create failed !');
    }

    if (!this.aggregatorContract) {
      throw new Error('Prediction Aggregator contract create failed !');
    }

    if (!this.nftContract) {
      throw new Error('NFT contract create failed !');
    }
  }

  private getPredictionContract() {
    const wallet = new ethers.Wallet(process.env.OWNER_ADDRESS_PRIVATEKEY, constant.PROVIDER);

    const predictionContract = new ethers.Contract(constant.ADDRESS.PREDICTION, constant.ABI.PREDICTION, wallet);

    return predictionContract;
  }

  private getTokenContract() {
    const wallet = new ethers.Wallet(process.env.OWNER_ADDRESS_PRIVATEKEY, constant.PROVIDER);

    const tokenContract = new ethers.Contract(constant.ADDRESS.TOKEN, constant.ABI.TOKEN, wallet);

    return tokenContract;
  }

  private getMarketContract() {
    const wallet = new ethers.Wallet(process.env.OWNER_ADDRESS_PRIVATEKEY, constant.PROVIDER);

    const marketContract = new ethers.Contract(constant.ADDRESS.MARKET, constant.ABI.MARKET, wallet);

    return marketContract;
  }

  private getDiceContract() {
    const wallet = new ethers.Wallet(process.env.OWNER_ADDRESS_PRIVATEKEY, constant.PROVIDER);

    const diceContract = new ethers.Contract(constant.ADDRESS.DICE, constant.ABI.DICE, wallet);

    return diceContract;
  }

  private getNftContract() {
    const wallet = new ethers.Wallet(process.env.OWNER_ADDRESS_PRIVATEKEY, constant.PROVIDER);

    const nftcontract = new ethers.Contract(constant.ADDRESS.NFT, constant.ABI.NFT, wallet);

    return nftcontract;
  }

  private getAggregatorContract() {
    const aggregatorContract = new ethers.Contract(constant.ADDRESS.AGGREGATOR, constant.ABI.AGGREGATOR, this.getMainetProvider());

    return aggregatorContract;
  }

  getMainetProvider() {
    const mainetProvider = new ethers.JsonRpcProvider(providerRPC['bsc'].rpc, {
      chainId: providerRPC['bsc'].chainId,
      name: providerRPC['bsc'].name,
    });
    return mainetProvider;
  }
}
