import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './use-case/user/user.module';
import { AuthModule } from './use-case/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ContractFactoryModule } from './service/contract-factory/contract-factory.module';
import { DataServicesModule } from './service/data-service/data-services.module';
import { TaskModule } from './use-case/task/task.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PredictionModule } from './use-case/prediction/prediction.module';
import { ChartModule } from './use-case/chart/chart.module';
import { LeaderboardModule } from './use-case/leaderboard/leaderboard.module';
import { SnapshotModule } from './use-case/snapshot/snapshot.module';
import { EventListenerModule } from './use-case/event listener/event-listener.module';
import { DiceModule } from './use-case/dice/dice.module';
import { DiceController } from './controller/dice.controller';
import { PredixController } from './controller/predix.controller';
import { HelperModule } from './use-case/helper/helper.module';
import { NFTController } from './controller/nft.controller';
import { LoggerFactoryModule } from './service/custom-logger/logger.service.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DataServicesModule,
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    ContractFactoryModule,
    LoggerFactoryModule,
    HelperModule,
    PredictionModule,
    DiceModule,
    SnapshotModule,
    UserModule,
    AuthModule,
    TaskModule,
    EventListenerModule,
    ChartModule,
    LeaderboardModule,
    // LoggerModule,
  ],
  controllers: [AppController, DiceController, PredixController, NFTController],
  providers: [],
})
export class AppModule { }
