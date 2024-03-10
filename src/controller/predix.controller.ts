import { Controller, Get } from '@nestjs/common';
import { IDataServices } from '../core/abstract/data-services/data-service.abstract';
import { ContractFactoryAbstract } from '../core/abstract/contract-factory/contract-factory.abstract';
import { PredictionService } from '../use-case/prediction/prediction.service';
import { HelperService } from '../use-case/helper/helper.service';
import constant from '../configuration';

@Controller('predix')
export class PredixController {
  constructor(
    private readonly db: IDataServices,

    private readonly factory: ContractFactoryAbstract,

    private readonly prediction: PredictionService,

    private readonly helper: HelperService,
  ) { }

  @Get('cancel')
  async cancel() {
    await this.prediction.cancelCurrentRound();
  }

  @Get('genesis-start')
  async test() {
    // await this.prediction.genesisStartRound();
  }

  @Get('genesis-lock')
  async genesisLock() {
    // await this.prediction.genesisLockRound();
  }

  @Get('execute')
  async executeRound() {
    await this.prediction.executeRound();
  }

  @Get('unpause')
  async unpause() {
    await this.helper.executeContract(
      this.factory.predictionContract,
      'unpause',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      20,
    );
  }

  @Get('pause')
  async pause() {
    await this.helper.executeContract(this.factory.predictionContract, 'pause', undefined, undefined, undefined, undefined, undefined);
  }
}
