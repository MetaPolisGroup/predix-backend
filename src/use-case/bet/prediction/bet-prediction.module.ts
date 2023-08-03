import { Module } from '@nestjs/common';
import { BetPredictionService } from './bet-prediction.service';
import { UserModule } from 'src/use-case/user/user.module';

@Module({
  providers: [BetPredictionService],
  controllers: [],
  imports: [UserModule],
  exports: [BetPredictionService],
})
export class BetPredictionModule {}
