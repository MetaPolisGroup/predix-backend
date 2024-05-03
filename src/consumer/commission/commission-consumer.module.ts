import { Module } from '@nestjs/common';
import { CommssionConsumer } from './commisson.consumer';
import { CommissionModule } from 'src/use-case/commission/commission.module';
import { UserModule } from 'src/use-case/user/user.module';

@Module({
    providers: [CommssionConsumer],
    exports: [CommssionConsumer],
    imports: [CommissionModule, UserModule],
})
export class CommissionConsumerModule {}
