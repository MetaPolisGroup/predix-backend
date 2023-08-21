import { Module } from '@nestjs/common';
import { BetMarketService } from './market/bet-market.service';
import { BetPredictionService } from './prediction/bet-prediction.service';
import { UserModule } from '../user/user.module';
import { BetDiceService } from './dice/bet-dice.service';

@Module({
  providers: [BetMarketService, BetPredictionService, BetDiceService],
  controllers: [],
  imports: [UserModule],
  exports: [BetMarketService, BetPredictionService, BetDiceService],
})
export class BetModule {}
