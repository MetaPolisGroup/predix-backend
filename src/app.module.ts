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
import { DatabaseModule } from './framework/database-mongodb/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { EventListenerModule } from './use-case/event listener/event-listener.module';
import { BetModule } from './use-case/bet/bet.module';
import { DiceModule } from './use-case/dice/dice.module';
import { DiceController } from './dice.controller';
import { PredixController } from './predix.controller';
import { HelperModule } from './use-case/helper/helper.module';
import { NFTController } from './nft.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DataServicesModule,
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    ContractFactoryModule,
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
    DatabaseModule,
    // LoggerModule,
    MongooseModule.forRoot(
      'mongodb+srv://doadmin:rR0J35Z71VWio928@db-mongodb-sgp1-76973-464ced0f.mongo.ondigitalocean.com/C300AMG?tls=true&authSource=admin&replicaSet=db-mongodb-sgp1-76973',
      {},
    ),
  ],
  controllers: [AppController, DiceController, PredixController, NFTController],
  providers: [],
})
export class AppModule {}
