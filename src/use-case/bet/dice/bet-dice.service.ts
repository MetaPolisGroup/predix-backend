import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import constant from 'src/configuration';
import { BetStatus } from 'src/configuration/type';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { Bet } from 'src/core/entity/bet.entity';
import { Dice } from 'src/core/entity/dice.entity';
import { HelperService } from 'src/use-case/helper/helper.service';

@Injectable()
export class BetDiceService implements OnApplicationBootstrap {
    async onApplicationBootstrap() {}

    constructor(
        private readonly db: IDataServices,
        private readonly helper: HelperService,
    ) {}

    async userBetBear(sender: string, epoch: bigint, amount: bigint) {
        //Const
        const betAmount = parseInt(amount.toString());

        const round = await this.db.diceRepo.getFirstValueCollectionDataByConditions([
            {
                field: 'epoch',
                operator: '==',
                value: parseInt(epoch.toString()),
            },
        ]);

        round.totalAmount += betAmount;
        round.bearAmount += betAmount;

        await this.db.diceRepo.upsertDocumentData(round.epoch.toString(), round);

        //Preferences
        const preferences = await this.db.preferenceRepo.getDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.DICE);
        let winning_amount = betAmount;

        if (preferences) {
            winning_amount = betAmount - (betAmount * (preferences.fee * 2)) / 10000;
        }

        const bet: Bet = {
            amount: betAmount,
            claimed: false,
            created_at: this.helper.getNowTimeStampsSeconds(),
            updated_at: this.helper.getNowTimeStampsSeconds(),
            deleted: false,
            epoch: parseInt(epoch.toString()),
            position: constant.BET.POS.DOWN,
            status: constant.BET.STATUS.WAITING,
            winning_amount,
            refund: 0,
            claim_amount: 0,
            round,
            user: null,
            after_refund_amount: 0,
            deleted_at: null,
            net: 0,
            net_after_fee: 0,
            user_address: sender,
        };

        await this.db.betDiceRepo.createDocumentData(bet);
    }

    async userBetBull(sender: string, epoch: bigint, amount: bigint) {
        //Const
        const betAmount = parseInt(amount.toString());

        //Round
        const round = await this.db.diceRepo.getFirstValueCollectionDataByConditions([
            {
                field: 'epoch',
                operator: '==',
                value: parseInt(epoch.toString()),
            },
        ]);

        round.totalAmount += betAmount;
        round.bullAmount += betAmount;

        await this.db.diceRepo.upsertDocumentData(round.epoch.toString(), round);

        //Preferences
        const preferences = await this.db.preferenceRepo.getDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.DICE);
        let winning_amount = betAmount;

        if (preferences) {
            winning_amount = betAmount - (betAmount * (preferences.fee * 2)) / 10000;
        }

        const bet: Bet = {
            amount: betAmount,
            claimed: false,

            created_at: this.helper.getNowTimeStampsSeconds(),
            updated_at: this.helper.getNowTimeStampsSeconds(),
            deleted: false,
            epoch: parseInt(epoch.toString()),
            position: constant.BET.POS.UP,
            status: constant.BET.STATUS.WAITING,
            winning_amount,
            refund: 0,
            claim_amount: 0,
            after_refund_amount: 0,
            deleted_at: null,
            net: 0,
            net_after_fee: 0,
            user: null,
            round,
            user_address: sender,
        };

        await this.db.betDiceRepo.createDocumentData(bet);
    }

    async userCutBet(epoch: bigint, sender: string, betAmount: bigint, refundAmount: bigint) {
        // Const
        const amount = parseInt(betAmount.toString());
        const refund = parseInt(refundAmount.toString());

        // Bet
        const bet = await this.db.betDiceRepo.getFirstValueCollectionDataByConditions([
            {
                field: 'epoch',
                operator: '==',
                value: parseInt(epoch.toString()),
            },
            {
                field: 'user_address',
                operator: '==',
                value: sender,
            },
        ]);

        if (!bet) {
            return;
        }

        //Preferences
        const preferences = await this.db.preferenceRepo.getDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.DICE);

        bet.amount = amount;
        bet.refund = refund;

        // Calculate winning amount
        if (amount > 0 && preferences) {
            bet.winning_amount = amount - (amount * (preferences.fee * 2)) / 10000;
        }

        // Set winning amount = amount bet if no preferences
        else if (!preferences) {
            bet.winning_amount = amount;
        }

        // Refund bet to use if bet amount being cut all
        else if (amount == 0) {
            bet.winning_amount = 0;
        }

        // Upsert
        await this.db.betDiceRepo.upsertDocumentData(bet.id, bet);
    }

    async updateBetWhenRoundIsEnded(epoch: bigint) {
        const round = await this.db.diceRepo.getFirstValueCollectionDataByConditions([
            {
                field: 'epoch',
                operator: '==',
                value: parseInt(epoch.toString()),
            },
        ]);

        //Update bets
        const bets = await this.db.betDiceRepo.getCollectionDataByConditions([
            {
                field: 'epoch',
                operator: '==',
                value: parseInt(epoch.toString()),
            },
        ]);

        // Update bet status & round
        if (bets) {
            for (const bet of bets) {
                bet.round = round ? round : null;
                bet.status = 'Refund';

                // Calculate result if bet amount > 0
                if (round && bet.amount > 0) {
                    bet.status = this.calculateResult(bet, round);
                }

                await this.db.betDiceRepo.upsertDocumentData(bet.id, bet);

                // Handle commission
                // await this.handleMoney.handlePoint(bet.amount, bet.user_address);
            }
        }
    }

    private calculateResult(bet: Bet, round: Dice): BetStatus {
        const { sum } = round;
        let result: BetStatus;

        if ((sum >= 11 && sum <= 18 && bet.position === 'UP') || (sum >= 3 && sum <= 10 && bet.position === 'DOWN')) {
            result = 'Win';
        } else {
            result = 'Lose';
        }

        return result;
    }
}
