import { Module } from '@nestjs/common';
import { PredictionService } from './prediction.service';
import { PredictionRoundService } from './prediction-round.service';

@Module({
  providers: [PredictionRoundService, PredictionService],
  controllers: [],
  imports: [],
  exports: [PredictionRoundService, PredictionService],
})
export class PredictionModule {}
