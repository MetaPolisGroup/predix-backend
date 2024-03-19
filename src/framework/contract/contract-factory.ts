import { Injectable } from '@nestjs/common';
import { AlchemyProvider, Contract, NonceManager, ethers, } from 'ethers';
import constant from 'src/configuration';
import { ChainType } from 'src/configuration/chain';
import { Chainlist } from 'src/configuration/chainlist';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';

@Injectable()
export class ContractFactory implements ContractFactoryAbstract {
  //Firestore

  readonly predictionContract: Contract;

  readonly tokenContract: Contract;

  readonly aggregatorContract: Contract;

  readonly provider: AlchemyProvider;

  readonly marketContract: Contract;

  readonly nftContract: Contract;

  readonly faucetContract: Contract;

  readonly diceContract: Contract;

  readonly signer: NonceManager;



  constructor() {
    // Provider
    this.provider = this.getAlchemyProvider();

    this.signer = this.getWalletFromPrivateKey();

    // Prediction Contract
    this.predictionContract = this.getPredictionContract();

    // Faucet Contract
    this.faucetContract = this.getFaucetContract();

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


  private getWalletFromPrivateKey() {
    const wallet = new ethers.Wallet(process.env.OWNER_ADDRESS_PRIVATEKEY, this.provider);
    const signer = new ethers.NonceManager(wallet)
    return signer
    // return wallet
  }

  private getWalletFromPrivateKey2() {
    const wallet = new ethers.Wallet(process.env.OWNER_ADDRESS_PRIVATEKEY2, this.provider);
    const signer = new ethers.NonceManager(wallet)
    return signer
    // return wallet
  }

  private getWalletFromPrivateKey3() {
    const wallet = new ethers.Wallet(process.env.OWNER_ADDRESS_PRIVATEKEY3, this.provider);
    const signer = new ethers.NonceManager(wallet)
    return signer
    // return wallet
  }

  private getPredictionContract() {
    const wallet = this.getWalletFromPrivateKey()

    const predictionContract = new ethers.Contract(constant.ADDRESS.PREDICTION, constant.ABI.PREDICTION, wallet);

    return predictionContract;
  }

  private getTokenContract() {
    const wallet = this.getWalletFromPrivateKey()

    const tokenContract = new ethers.Contract(constant.ADDRESS.TOKEN, constant.ABI.TOKEN, wallet);

    return tokenContract;
  }

  private getFaucetContract() {
    const wallet = this.getWalletFromPrivateKey2()

    const faucetContract = new ethers.Contract(constant.ADDRESS.FAUCET, constant.ABI.FAUCET, wallet);

    return faucetContract;
  }

  private getMarketContract() {
    const wallet = this.getWalletFromPrivateKey3()

    const marketContract = new ethers.Contract(constant.ADDRESS.MARKET, constant.ABI.MARKET, wallet);

    return marketContract;
  }

  private getDiceContract() {

    const wallet = this.getWalletFromPrivateKey2()

    const diceContract = new ethers.Contract(constant.ADDRESS.DICE, constant.ABI.DICE, wallet);

    return diceContract;
  }

  private getNftContract() {
    const wallet = this.getWalletFromPrivateKey()

    const nftcontract = new ethers.Contract(constant.ADDRESS.NFT, constant.ABI.NFT, wallet);

    return nftcontract;
  }

  private getAggregatorContract() {
    const aggregatorContract = new ethers.Contract(constant.ADDRESS.AGGREGATOR, constant.ABI.AGGREGATOR, this.getProvider(ChainType.BSC));

    return aggregatorContract;
  }

  getAlchemyProvider() {
    const provider = new AlchemyProvider({
      chainId: 84532,
      name: "base-sepolia",
    }, process.env.ALCHEMY_API_KEY);
    return provider
  }

  getProvider(chain: ChainType) {
    const mainetProvider = new ethers.JsonRpcProvider(Chainlist[chain].rpc, {
      chainId: Chainlist[chain].chainId,
      name: Chainlist[chain].name,
    });
    return mainetProvider;
  }
}
