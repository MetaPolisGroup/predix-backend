import { Injectable } from '@nestjs/common';
import { Contract, JsonRpcProvider, ethers } from 'ethers';
import constant from 'src/configuration';
import { providerRPC } from 'src/configuration/provider';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';

@Injectable()
export class ContractFactory implements ContractFactoryAbstract {
  //Firestore

  readonly predictionContract: Contract;

  readonly predictionAdminContract: Contract;

  readonly aggregatorContract: Contract;

  readonly provider: JsonRpcProvider;

  constructor() {
    // Provider
    this.provider = constant.PROVIDER;

    // PredictionContract
    this.predictionContract = new ethers.Contract(
      constant.ADDRESS.PREDICTION,
      new ethers.Interface(constant.ABI.PREDICTION),
      constant.PROVIDER,
    );

    // PredictionAdminContract
    this.predictionAdminContract = this.getPredictionAdminContract();

    // Aggregator contract
    this.aggregatorContract = new ethers.Contract(constant.ADDRESS.AGGREGATOR, constant.ABI.AGGREGATOR, this.getMainetProvider());

    if (!this.provider) {
      throw new Error('Provider not found !');
    }

    if (!this.predictionContract) {
      throw new Error('Prediction contract create failed !');
    }

    if (!this.predictionAdminContract) {
      throw new Error('Prediction admin contract create failed !');
    }

    if (!this.aggregatorContract) {
      throw new Error('Prediction Aggregator contract create failed !');
    }
  }

  private getPredictionAdminContract() {
    const wallet = new ethers.Wallet(process.env.OWNER_ADDRESS_PRIVATEKEY, constant.PROVIDER);

    const predictionContract = new ethers.Contract(constant.ADDRESS.PREDICTION, constant.ABI.PREDICTION, wallet);

    return predictionContract;
  }

  getMainetProvider() {
    const mainetProvider = new ethers.JsonRpcProvider(providerRPC['bsc'].rpc, {
      chainId: providerRPC['bsc'].chainId,
      name: providerRPC['bsc'].name,
    });
    return mainetProvider;
  }
}
