import { Injectable } from '@nestjs/common';
import { Contract, JsonRpcProvider, ethers } from 'ethers';
import constant from 'src/configuration';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';

@Injectable()
export class ContractFactory implements ContractFactoryAbstract {
  //Firestore

  readonly predictionContract: Contract;

  readonly provider: JsonRpcProvider;

  constructor() {
    this.provider = constant.PROVIDER;
    this.predictionContract = new ethers.Contract(
      constant.ADDRESS.PREDICTION,
      new ethers.Interface(constant.ABI.PREDICTION),
      constant.PROVIDER,
    );
  }
}
