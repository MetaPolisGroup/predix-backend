import { Module } from '@nestjs/common';
import { ChainlinkService } from './prediction-chainlink.service';
import { PredictionService } from './prediction.service';
import { PredictionRoundService } from './prediction-round.service';

@Module({
  providers: [ChainlinkService, PredictionService, PredictionRoundService],
  controllers: [],
  imports: [],
  exports: [ChainlinkService, PredictionService, PredictionRoundService],
})
export class PredictionModule {}
