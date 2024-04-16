/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Controller, Get, Req } from '@nestjs/common';
import { IDataServices } from '../core/abstract/data-services/data-service.abstract';
import { UserAuthenService } from '../use-case/user/user-authen.service';
import { ContractFactoryAbstract } from '../core/abstract/contract-factory/contract-factory.abstract';
import { LeaderboardService } from '../use-case/leaderboard/leader.service';
import { PredixOperatorContract } from '../use-case/contracts/predix/prediction-operator.service';
import { DiceService } from '../use-case/games/dice/dice.service';
import { HelperService } from '../use-case/helper/helper.service';

@Controller('dice')
export class DiceController {
    constructor(
        private readonly db: IDataServices,

        private readonly factory: ContractFactoryAbstract,

        private readonly dice: DiceService,
        private readonly helper: HelperService,
    ) {}

    // @Get('bet')
    // async bet() {
    //     const currentEpoch = await this.factory.diceContract.currentEpoch();
    //     const gasLimit = await this.factory.diceContract.betBear.estimateGas(currentEpoch.toString(), '200');
    //     const gasPrice = await this.factory.provider.getFeeData();

    //     const executeRoundTx = await this.factory.diceContract.betBear(currentEpoch.toString(), '200', {
    //         gasLimit,
    //         gasPrice: gasPrice.gasPrice,
    //         maxFeePerGas: gasPrice.maxFeePerGas,
    //         maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
    //     });

    //     const executeRound = await this.factory.provider.waitForTransaction(executeRoundTx.hash as string);

    //     // Execute round success
    //     if (executeRound.status === 1) {
    //         console.log(`execute successfully!`);
    //     }

    //     // Execute round failed
    //     else {
    //         console.log(` executed failed! `);
    //     }
    // }

    // @Get('cancel')
    // async cancel() {
    //     await this.dice.cancelCurrentRound();
    // }

    // @Get('pause')
    // async pause() {
    //     await this.helper.executeContract(
    //         this.factory.diceContract,
    //         'pause',
    //         undefined,
    //         undefined,
    //         undefined,
    //         undefined,
    //         undefined,
    //     );
    // }

    // @Get('genesis-start')
    // async test() {
    //     await this.dice.genesisStartRound();
    // }

    // @Get('genesis-end')
    // async genesisEnd() {
    //     await this.dice.genesisEndRound();
    // }

    // @Get('execute')
    // async executeRound() {
    //     await this.dice.executeRound();
    // }
}
