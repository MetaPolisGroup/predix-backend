import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './use-case/user/user.module';
import { AuthModule } from './use-case/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { EventListenerModule } from './use-case/event listener/event-listener.module';
import { ContractFactoryModule } from './service/contract-factory/contract-factory.module';
import { DataServicesModule } from './service/data-service/data-services.module';
import { TaskModule } from './use-case/task/task.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PredictionModule } from './use-case/prediction/prediction.module';
import { ChartModule } from './use-case/chart/chart.module';
import { LeaderboardModule } from './use-case/leaderboard/leaderboard.module';
import { AppService } from './app.service';
import { SnapshotModule } from './use-case/snapshot/snapshot.module';
import { BetPredictionModule } from './use-case/bet/prediction/bet-prediction.module';
import { DatabaseModule } from './core/database-mongodb/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { BetMongoModule } from './core/database-mongodb/bet/bet.module';
import { ChainlinkMongoModule } from './core/database-mongodb/chain-link/chain-link.module';
import { UserMongoModule } from './core/database-mongodb/user/user.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DataServicesModule,
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    SnapshotModule,
    UserModule,
    AuthModule,
    PredictionModule,
    ContractFactoryModule,
    // TaskModule,
    EventListenerModule,
    ChartModule,
    LeaderboardModule,
    BetPredictionModule,
    DatabaseModule,
    MongooseModule.forRoot(process.env.MONGO_DB_HOST, {}),
    UserMongoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
