import { Injectable } from '@nestjs/common';
import { Bet } from 'src/core/entity/bet.entity';
import { CommissionService } from 'src/use-case/commission/commission.service';
import { UserUsecaseService } from 'src/use-case/user/user.service';

@Injectable()
export class CommssionConsumer {
    constructor(
        private readonly commission: CommissionService,
        private readonly user: UserUsecaseService,
    ) {}

    async handleDirectComp(bet: Bet) {
        const ref = await this.user.getUserByAddress(bet.user.ref);
        if (!ref) return;
        const user = await this.user.getUserByAddress(bet.user.address);
        if (!user) return;

        const directCompAmount = this.commission.calculateDirectCommisson(bet.after_refund_amount);
        const directCompRecord = this.commission.commissionDirect(directCompAmount, bet.epoch, user, ref);
        this.commission.create(directCompRecord);
        this.user.updateIncrement(user.ref, {
            commission: directCompAmount,
        });
    }

    async handleIndirectComp(bet: Bet, commission: number, receiverAddr: string) {
        const receiver = await this.user.getUserByAddress(receiverAddr);
        if (!receiver) return;
        const user = await this.user.getUserByAddress(bet.user.address);
        if (!user) return;

        const commissionRecord = this.commission.commissionIndirect(commission, bet.epoch, user, receiver);
        this.commission.create(commissionRecord);
        this.user.updateIncrement(receiverAddr, { commission: commission });
    }
}
