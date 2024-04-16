import { Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { MarketRoundService } from './market-round.service';

@Module({
    providers: [MarketService, MarketRoundService],
    controllers: [],
    imports: [],
    exports: [MarketService, MarketRoundService],
})
export class MarketModule {}
