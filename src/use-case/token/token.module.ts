import { Module } from '@nestjs/common';
import { PreTokenService } from './pre-token/pre-token.service';
import { NativeTokenService } from './native-token/native-token.service';
import { WalletModule } from '../wallet/wallet.module';

@Module({
    providers: [PreTokenService, NativeTokenService],
    imports: [WalletModule],
    exports: [PreTokenService, NativeTokenService],
})
export class TokenModule {}
