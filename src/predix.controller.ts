import { Controller, Get } from '@nestjs/common';
import { IDataServices } from './core/abstract/data-services/data-service.abstract';
import { ContractFactoryAbstract } from './core/abstract/contract-factory/contract-factory.abstract';
import { PredictionService } from './use-case/prediction/prediction.service';

@Controller('predix')
export class PredixController {
  constructor(
    private readonly db: IDataServices,

    private readonly factory: ContractFactoryAbstract,

    private readonly prediction: PredictionService,
  ) {}

  @Get('cancel')
  async cancel() {
    await this.prediction.cancelCurrentRound();
  }

  @Get('genesis-start')
  async test() {
    await this.prediction.genesisStartRound();
  }

  @Get('genesis-lock')
  async genesisLock() {
    await this.prediction.genesisLockRound();
  }

  @Get('execute')
  async executeRound() {
    await this.prediction.executeRound();
  }

  @Get('unpause')
  async unpause() {
    const gasLimit = await this.factory.predictionContract.unpause.estimateGas();
    const gasPrice = await this.factory.provider.getFeeData();

    const executeRoundTx = await this.factory.predictionContract.unpause({
      gasLimit,
      gasPrice: gasPrice.gasPrice,
      maxFeePerGas: gasPrice.maxFeePerGas,
      maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
    });

    const executeRound = await this.factory.provider.waitForTransaction(executeRoundTx.hash as string);

    // Execute round success
    if (executeRound.status === 1) {
      console.log(`execute successfully!`);
    }

    // Execute round failed
    else {
      console.log(` executed failed! `);
    }
  }

  @Get('pause')
  async pause() {
    const gasLimit = await this.factory.predictionContract.pause.estimateGas();
    const gasPrice = await this.factory.provider.getFeeData();

    const executeRoundTx = await this.factory.predictionContract.pause({
      gasLimit,
      gasPrice: gasPrice.gasPrice,
      maxFeePerGas: gasPrice.maxFeePerGas,
      maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
    });

    const executeRound = await this.factory.provider.waitForTransaction(executeRoundTx.hash as string);

    // Execute round success
    if (executeRound.status === 1) {
      console.log(`execute successfully!`);
    }

    // Execute round failed
    else {
      console.log(` executed failed! `);
    }
  }
}
