import { Module } from '@nestjs/common';
import { PredixStatisticService } from './predix/predix-statistic.service';
import { ManipulationModule } from '../manipulation/manipulation.module';
import { BetModule } from '../bet/bet.module';
import { PredictionModule } from '../games/prediction/prediction.module';

@Module({
    providers: [PredixStatisticService],
    exports: [PredixStatisticService],
    imports: [ManipulationModule, BetModule, PredictionModule, ManipulationModule],
})
export class StatisticModule {}
