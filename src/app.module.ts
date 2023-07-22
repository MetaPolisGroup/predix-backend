import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './use-case/user/user.module';
import { AuthModule } from './use-case/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PredictionModule } from './use-case/event listener/event-listener.module';
import { ContractFactoryModule } from './service/contract-factory/contract-factory.module';
import { DataServicesModule } from './service/data-service/data-services.module';
import { TaskModule } from './use-case/task/task.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    DataServicesModule,
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    UserModule,
    AuthModule,
    MongooseModule.forRoot(process.env.MONGO_DB_HOST, {}),
    PredictionModule,
    ContractFactoryModule,
    ScheduleModule.forRoot(),
    TaskModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
