import { Module } from '@nestjs/common';
import { FaucetService } from './faucet.service';
import { TokenModule } from '../token/token.module';

@Module({
    providers: [FaucetService],
    exports: [FaucetService],
    imports: [TokenModule],
})
export class FaucetModule {}
