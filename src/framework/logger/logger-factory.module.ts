import { Module } from '@nestjs/common';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { LoggerFactory } from './logger-factory.framework';

@Module({
    providers: [
        {
            provide: ILoggerFactory,
            useClass: LoggerFactory,
        },
    ],
    exports: [ILoggerFactory],
})
export class LoggerFactoryFramework {}
