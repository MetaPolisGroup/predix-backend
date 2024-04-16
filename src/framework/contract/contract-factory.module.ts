import { Global, Module } from '@nestjs/common';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { ContractFactory } from './contract-factory';

@Global()
@Module({
    providers: [
        {
            provide: ContractFactoryAbstract,
            useClass: ContractFactory,
        },
    ],
    exports: [ContractFactoryAbstract],
})
export class ContractFrameworkModule {}
