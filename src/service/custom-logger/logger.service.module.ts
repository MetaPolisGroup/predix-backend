import { Global, Module } from '@nestjs/common';
import { LoggerFactoryFramework } from 'src/framework/logger/logger-factory.module';
@Global()
@Module({
  imports: [LoggerFactoryFramework],
  exports: [LoggerFactoryFramework],
})
export class LoggerFactoryModule { }
