import { Module } from '@nestjs/common';
import { BetMarketService } from './market/bet-market.service';
import { BetPredictionService } from './prediction/bet-prediction.service';
import { UserModule } from '../user/user.module';
import { BetDiceService } from './dice/bet-dice.service';
import { PredictionModule } from '../games/prediction/prediction.module';

@Module({
    providers: [BetMarketService, BetPredictionService, BetDiceService],
    controllers: [],
    imports: [UserModule, PredictionModule],
    exports: [BetMarketService, BetPredictionService, BetDiceService],
})
export class BetModule {}
