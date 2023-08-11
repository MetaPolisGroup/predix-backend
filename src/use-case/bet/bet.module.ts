import { Module } from '@nestjs/common';
import { BetMarketService } from './market/bet-market.service';
import { BetPredictionService } from './prediction/bet-prediction.service';
import { UserModule } from '../user/user.module';

@Module({
  providers: [BetMarketService, BetPredictionService],
  controllers: [],
  imports: [UserModule],
  exports: [BetMarketService, BetPredictionService],
})
export class BetModule {}
