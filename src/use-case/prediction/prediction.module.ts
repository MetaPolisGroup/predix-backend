import { Module } from '@nestjs/common';
import { ChainlinkService } from './prediction-chainlink.service';
import { PredictionService } from './prediction.service';

@Module({
  providers: [ChainlinkService, PredictionService],
  controllers: [],
  imports: [],
  exports: [ChainlinkService, PredictionService],
})
export class PredictionModule {}
