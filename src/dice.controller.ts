import { Controller, Get, Req } from '@nestjs/common';
import { IDataServices } from './core/abstract/data-services/data-service.abstract';
import { UserAuthenService } from './use-case/user/user-authen.service';
import { ContractFactoryAbstract } from './core/abstract/contract-factory/contract-factory.abstract';
import { LeaderboardService } from './use-case/leaderboard/leader.service';
import { PredictionService } from './use-case/prediction/prediction.service';
import { DiceService } from './use-case/dice/dice.service';

@Controller('dice')
export class DiceController {
  constructor(
    private readonly db: IDataServices,

    private readonly factory: ContractFactoryAbstract,

    private readonly dice: DiceService,
  ) {}

  @Get('cancel')
  async cancel() {
    await this.dice.cancelCurrentRound();
  }

  @Get('genesis-start')
  async test() {
    await this.dice.genesisStartRound();
  }

  @Get('genesis-end')
  async genesisEnd() {
    await this.dice.genesisEndRound();
  }

  @Get('execute')
  async executeRound() {
    await this.dice.executeRound();
  }
}
