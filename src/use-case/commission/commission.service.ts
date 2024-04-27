import { Injectable } from '@nestjs/common';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { CommissionRecord, CommissionType } from 'src/core/entity/commission-record.entity';
import { User } from 'src/core/entity/user.enity';
import { HelperService } from '../helper/helper.service';

@Injectable()
export class CommissionService {
    constructor(
        private readonly db: IDataServices,
        private readonly helper: HelperService,
    ) {}

    commissionDirect(amount: number, sender: User, receiver: User) {
        const commissionRecord: CommissionRecord = this.createRecord(
            amount,
            receiver.commission,
            receiver.commission + amount,
            'Direct',
            sender,
            receiver,
        );
        return commissionRecord;
    }

    commissionIndirect(amount: number, sender: User, receiver: User) {
        const commissionRecord: CommissionRecord = this.createRecord(
            amount,
            receiver.commission,
            receiver.commission + amount,
            'Indirect',
            sender,
            receiver,
        );
        return commissionRecord;
    }

    commissionWithdraw(sender: User) {
        const commissionRecord: CommissionRecord = this.createRecord(
            sender.commission,
            sender.commission,
            0,
            'Withdraw',
            sender,
            sender,
        );
        return commissionRecord;
    }

    upsert(id: string, commission: Partial<CommissionRecord>) {
        return this.db.commissionRecordRepo.upsertDocumentData(id, {
            ...commission,
            updated_at: this.helper.getNowTimeStampsSeconds(),
        });
    }

    create(commission: CommissionRecord) {
        return this.db.commissionRecordRepo.createDocumentData({
            ...commission,
            created_at: this.helper.getNowTimeStampsSeconds(),
        });
    }

    createRecord(
        amount: number,
        before_amount: number,
        after_amount: number,
        type: CommissionType,
        sender: User,
        receiver: User,
    ) {
        const record: CommissionRecord = {
            deleted: false,
            amount,
            before_amount,
            after_amount,
            type,
            sender: {
                address: sender.address,
                type: sender.type,
            },
            receiver: {
                address: receiver.address,
                type: receiver.type,
            },
        };
        return record;
    }

    calculateDirectCommisson(amount: number) {
        const comp = (amount * 0.8) / 100;
        return comp;
    }

    async calculateIndirectCommission(
        user_tree_belong: string[],
        betAmount: number,
        callBack: (s: { commission: number; user_address: string }) => Promise<void> | void,
    ) {
        let revenue_share: number;
        for (let i = 0; i < user_tree_belong.length && i < 3; i++) {
            const recommend_id = user_tree_belong[i];
            if (recommend_id) {
                switch (i) {
                    case 0:
                        revenue_share = 0.4;
                        break;
                    case 1:
                        revenue_share = 0.2;
                        break;
                    case 2:
                        revenue_share = 0.1;
                        break;
                }
                await callBack({
                    commission: (betAmount * revenue_share) / 100,
                    user_address: recommend_id,
                });
            }
        }
    }
}
