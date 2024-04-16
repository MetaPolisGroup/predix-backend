import { ContractGenericAbstract } from "./contract-generic.abstract";
import { ContractMultiWalletsAbstract } from "./contract-multiwallets.abstract";

export abstract class ContractFactoryAbstract {
    // Predix

    abstract predictionContract: ContractGenericAbstract;

    abstract predictionBotContract: ContractMultiWalletsAbstract;

    // Torken

    abstract tokenContract: ContractMultiWalletsAbstract;

    abstract marketContract: ContractGenericAbstract;

    abstract diceContract: ContractGenericAbstract;

    abstract nftContract: ContractGenericAbstract;

    abstract aggregatorContract: ContractGenericAbstract;

    abstract faucetContract: ContractMultiWalletsAbstract;
}
