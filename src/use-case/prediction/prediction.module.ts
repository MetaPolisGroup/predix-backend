import { Module } from '@nestjs/common';
import { PredictionService } from './prediction.service';
import { PredictionRoundService } from './prediction-round.service';

@Module({
  providers: [PredictionService, PredictionRoundService],
  controllers: [],
  imports: [],
  exports: [PredictionService, PredictionRoundService],
})
export class PredictionModule {}
