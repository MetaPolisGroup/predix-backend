import { Global, Module } from "@nestjs/common";
import { ContractFrameworkModule } from "src/framework/contract/contract-factory.module";
@Global()
@Module({
    imports: [ContractFrameworkModule],
    exports: [ContractFrameworkModule],
})
export class ContractFactoryModule {}
