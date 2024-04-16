import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import constant from 'src/configuration';
import { BetStatus, Position } from 'src/configuration/type';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { Bet } from 'src/core/entity/bet.entity';
import { Prediction } from 'src/core/entity/prediction.enity';
import { Preferences } from 'src/core/entity/preferences.entity';
import { PredictionRoundService } from 'src/use-case/games/prediction/prediction-round.service';
import { HelperService } from 'src/use-case/helper/helper.service';
import { PreferenceService } from 'src/use-case/preference/preference.service';
import { UserHandleMoney } from 'src/use-case/user/user-handle-money.service';
import { UserService } from 'src/use-case/user/user.service';

@Injectable()
export class BetPredictionService implements OnApplicationBootstrap {
    async onApplicationBootstrap() {}

    constructor(
        private readonly db: IDataServices,
        private readonly handleMoney: UserHandleMoney,
        private readonly userService: UserService,
        private readonly helper: HelperService,
        private readonly preference: PreferenceService,
        private readonly predixRound: PredictionRoundService,
    ) {}

    async userBetBear(sender: string, epoch: number, betAmount: number, hash: string) {
        //Const

        return this._createBet(sender, epoch, betAmount, constant.BET.POS.DOWN, hash);
    }

    async userBetBull(sender: string, epoch: number, betAmount: number, hash: string) {
        //Round
        return this._createBet(sender, epoch, betAmount, constant.BET.POS.UP, hash);
    }

    private async _createBet(sender: string, epoch: number, betAmount: number, position: Position, hash: string) {
        const round = await this.predixRound.getRoundByEpoch(epoch);
        const user = await this.userService.getUserByAddress(sender);

        const bet: Bet = {
            epoch,
            hash,
            user_address: sender,
            position,
            status: constant.BET.STATUS.WAITING,
            amount: betAmount,
            after_refund_amount: 0,
            winning_amount: 0,
            refund: 0,
            claim_amount: 0,
            claimed: false,
            net: 0,
            net_after_fee: 0,
            round,
            user,
            created_at: this.helper.getNowTimeStampsSeconds(),
            updated_at: this.helper.getNowTimeStampsSeconds(),
            deleted_at: null,
            deleted: false,
        };

        return this.db.betRepo.createDocumentData(bet);
    }

    async userCutBet(epoch: number, sender: string, betAmount: number, refundAmount: number) {
        // Bet
        const bet = await this.getBetByAddressAndEpoch(sender, epoch);

        if (!bet) {
            return;
        }

        bet.refund = refundAmount;

        // Upsert
        await this.db.betRepo.upsertDocumentData(bet.id, bet);
    }

    async updateBetsWhenRoundIsLocked(bets: Bet[], round: Prediction, index = 0): Promise<Bet[]> {
        if (!bets || index >= bets.length) {
            return bets;
        }

        const bet = bets[index];
        bet.after_refund_amount = bet.amount - bet.refund;
        bet.round = round;

        await this.db.betRepo.upsertDocumentData(bet.id, bet);

        return this.updateBetsWhenRoundIsLocked(bets, round, index + 1);
    }

    async updateBetsWhenRoundIsEnded(
        bets: Bet[],
        round: Prediction,
        preference: Preferences,
        index = 0,
    ): Promise<Bet[]> {
        if (!bets || index >= bets.length) {
            return bets;
        }

        const { after_refund_amount, refund, position } = bets[index];
        let { status, winning_amount, net, net_after_fee, claim_amount } = bets[index];
        const calculatedWinAmount = after_refund_amount - (after_refund_amount * (preference.fee * 2)) / 10000;

        const win = round.result === position;

        switch (win) {
            case true:
                winning_amount = calculatedWinAmount;
                claim_amount += after_refund_amount;
                net = after_refund_amount;
                net_after_fee = calculatedWinAmount;
                status = refund > 0 ? 'Winning Refund' : 'Win';
                break;
            case false:
                net = -after_refund_amount;
                net_after_fee = -calculatedWinAmount;
                status = refund > 0 ? 'Losing Refund' : 'Lose';
                break;

            default:
                claim_amount = after_refund_amount;
                net = 0;
                net_after_fee = 0;
                status = 'Draw';
        }

        claim_amount += refund + winning_amount;

        await this.db.betRepo.upsertDocumentData(bets[index].id, {
            round,
            status,
            winning_amount,
            claim_amount,
            net,
            net_after_fee,
        });

        return this.updateBetsWhenRoundIsEnded(bets, round, preference, index + 1);
    }

    async getBetByAddressAndEpoch(address: string, epoch: number) {
        const bet = await this.db.betRepo.getFirstValueCollectionDataByConditions([
            {
                field: 'epoch',
                operator: '==',
                value: epoch,
            },
            {
                field: 'user_address',
                operator: '==',
                value: address,
            },
        ]);
        return bet;
    }

    async getBetsByEpoch(epoch: number) {
        const bets = await this.db.betRepo.getCollectionDataByConditions([
            {
                field: 'epoch',
                operator: '==',
                value: epoch,
            },
        ]);

        return bets;
    }

    async getBotBetsByEpoch(epoch: number) {
        return this.db.betRepo.getCollectionDataByConditions([
            {
                field: 'epoch',
                operator: '==',
                value: epoch,
            },
            {
                field: 'user.type',
                operator: '==',
                value: constant.USER.TYPE.BOT,
            },
        ]);
    }

    async getBotBetUpsByEpoch(epoch: number) {
        return this.db.betRepo.getCollectionDataByConditions([
            {
                field: 'epoch',
                operator: '==',
                value: epoch,
            },
            {
                field: 'user.type',
                operator: '==',
                value: constant.USER.TYPE.BOT,
            },
            {
                field: 'position',
                operator: '==',
                value: constant.BET.POS.UP,
            },
        ]);
    }

    async getBotBetDownsByEpoch(epoch: number) {
        return this.db.betRepo.getCollectionDataByConditions([
            {
                field: 'epoch',
                operator: '==',
                value: epoch,
            },
            {
                field: 'user.type',
                operator: '==',
                value: constant.USER.TYPE.BOT,
            },
            {
                field: 'position',
                operator: '==',
                value: constant.BET.POS.DOWN,
            },
        ]);
    }

    async getBotBetsHasResultOfIncludedRoundFrom(from: number) {
        return this.db.betRepo.getCollectionDataByConditions([
            {
                field: 'round.include',
                operator: '==',
                value: true,
            },
            {
                field: 'user.type',
                operator: '==',
                value: constant.USER.TYPE.BOT,
            },
            { field: 'status', operator: '!=', value: constant.BET.STATUS.WAITING },
            { field: 'created_at', operator: '>=', value: from },
        ]);
    }
}
