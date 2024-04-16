import { Module } from '@nestjs/common';
import { PredixFakeBotService } from './prediction/predix-fake-bot.service';
import { PredictionModule } from '../../use-case/games/prediction/prediction.module';
import { UserModule } from '../../use-case/user/user.module';
import { WalletModule } from '../../use-case/wallet/wallet.module';
import { TokenModule } from '../../use-case/token/token.module';

@Module({
    providers: [PredixFakeBotService],
    controllers: [],
    imports: [PredictionModule, UserModule, WalletModule, TokenModule],
    exports: [PredixFakeBotService],
})
export class BotsModule {}
