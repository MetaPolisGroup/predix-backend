import { Module } from '@nestjs/common';
import { PredixBotContract } from './predix/prediction-bot.service';
import { PredixOperatorContract } from './predix/prediction-operator.service';

@Module({
    providers: [PredixBotContract, PredixOperatorContract],
})
export class ContractsModule {}
