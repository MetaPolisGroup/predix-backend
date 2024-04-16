import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './use-case/user/user.module';
import { AuthModule } from './use-case/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ContractFactoryModule } from './service/contract-factory/contract-factory.module';
import { DataServicesModule } from './service/data-service/data-services.module';
import { TaskModule } from './consumer/task/task.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PredictionModule } from './use-case/games/prediction/prediction.module';
import { ChartModule } from './use-case/chart/chart.module';
import { LeaderboardModule } from './use-case/leaderboard/leaderboard.module';
import { SnapshotModule } from './consumer/snapshot/snapshot.module';

import { DiceModule } from './use-case/games/dice/dice.module';
import { DiceController } from './controller/dice.controller';
import { PredixController } from './controller/predix.controller';
import { HelperModule } from './use-case/helper/helper.module';
import { NFTController } from './controller/nft.controller';
import { LoggerFactoryModule } from './service/custom-logger/logger.service.module';
import { BotsModule } from './consumer/bots/bots.module';
import { WalletModule } from './use-case/wallet/wallet.module';
import { FaucetModule } from './use-case/faucet/faucet.module';
import { TokenModule } from './use-case/token/token.module';
import { PreferenceModule } from './use-case/preference/preference.module';
import { StatisticModule } from './use-case/statistic/statistic.module';
import { ManipulationModule } from './use-case/manipulation/manipulation.module';
import { EventListenerModule } from './consumer/event/event.module';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        DataServicesModule,
        ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
        ContractFactoryModule,
        LoggerFactoryModule,
        HelperModule,
        PreferenceModule,
        PredictionModule,
        DiceModule,
        SnapshotModule,
        UserModule,
        AuthModule,
        TaskModule,
        EventListenerModule,
        ChartModule,
        LeaderboardModule,
        BotsModule,
        WalletModule,
        TokenModule,
        FaucetModule,
        StatisticModule,
        ManipulationModule,
        // LoggerModule,
    ],
    controllers: [AppController, DiceController, PredixController, NFTController],
    providers: [],
})
export class AppModule {}
