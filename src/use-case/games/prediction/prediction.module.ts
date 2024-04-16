import { Module } from '@nestjs/common';
import { PredixOperatorContract } from '../../contracts/predix/prediction-operator.service';
import { PredictionRoundService } from './prediction-round.service';
import { PredixBotContract } from '../../contracts/predix/prediction-bot.service';
import { PredictionSchedulerService } from '../../../consumer/scheduler/predix/prediction-scheduler.service';
import { UserModule } from 'src/use-case/user/user.module';
import { PreferenceModule } from 'src/use-case/preference/preference.module';
import { ManipulationModule } from 'src/use-case/manipulation/manipulation.module';
import { ChainlinkModule } from 'src/use-case/chainlink/chainlink.module';

@Module({
    providers: [PredictionRoundService, PredixOperatorContract, PredixBotContract, PredictionSchedulerService],
    controllers: [],
    imports: [UserModule, PreferenceModule, ManipulationModule, ChainlinkModule],
    exports: [PredictionRoundService, PredixOperatorContract, PredixBotContract, PredictionSchedulerService],
})
export class PredictionModule {}
