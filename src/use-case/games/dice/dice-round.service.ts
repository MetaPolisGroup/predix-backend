import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import constant from 'src/configuration';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { Dice } from 'src/core/entity/dice.entity';
import { DiceService } from './dice.service';
import { Preferences } from 'src/core/entity/preferences.entity';

@Injectable()
export class DiceRoundService implements OnApplicationBootstrap {
    logger: ILogger;

    async onApplicationBootstrap() {
        if (process.env.CONSTANT_ENABLE_DICE === 'True') {
            await this.updateDicePreference();
            await this.updateCurrentRound();
            await this.validateRoundInDb();
        }
    }

    constructor(
        private readonly db: IDataServices,
        private readonly logFactory: ILoggerFactory,
        private readonly diceOperator: DiceService,
    ) {
        this.logger = this.logFactory.diceLogger;
    }

    async createNewRound(epoch: bigint) {
        const preferences = await this.db.preferenceRepo.getDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.DICE);
        const now = Math.round(new Date().getTime() / 1000);

        if (!preferences) {
            this.logger.error(`Preferences not found !`);
            return;
        }

        // Update round
        const round: Dice = {
            epoch: parseInt(epoch.toString()),
            bearAmount: 0,
            include: false,
            bullAmount: 0,
            totalAmount: 0,
            dice1: 0,
            dice2: 0,
            dice3: 0,
            sum: 0,
            startTimestamp: now,
            closeTimestamp: now + preferences.interval_seconds,
            closed: false,
            cancel: false,
            deleted: false,
        };
        await this.db.diceRepo.upsertDocumentData(epoch.toString(), round);
    }

    async updateEndRound(epoch: bigint, dice1: bigint, dice2: bigint, dice3: bigint) {
        const round = await this.getRoundByEpoch(Number(epoch));
        //
        const d1 = parseInt(dice1.toString());
        const d2 = parseInt(dice2.toString());
        const d3 = parseInt(dice3.toString());

        // Update round
        round.closeTimestamp = Math.round(new Date().getTime() / 1000);
        round.dice1 = d1;
        round.dice2 = d2;
        round.dice3 = d3;
        round.sum = d1 + d2 + d3;
        round.closed = true;
        round.cancel = round.totalAmount <= 0;

        await this.db.diceRepo.upsertDocumentData(round.epoch.toString(), round);
    }

    async getRoundByEpoch(epoch: number) {
        const round = await this.db.diceRepo.getFirstValueCollectionDataByConditions([
            {
                field: 'epoch',
                operator: '==',
                value: parseInt(epoch.toString()),
            },
        ]);

        if (!round) {
            this.logger.error(`Round ${epoch.toString()} not found from DB when ended on chain !`);
        }
        return round;
    }

    async updateCurrentRound() {
        const currentEpoch = await this.diceOperator.getCurrentEpoch();

        // Update Current round
        if (currentEpoch <= 0) {
            return;
        }

        const currentRound = await this.diceOperator.getRoundFromChain(currentEpoch);
        await this.db.diceRepo.upsertDocumentData(currentRound.epoch.toString(), currentRound);

        if (currentEpoch > 1) {
            // Update Live round
            const liveRound = await this.diceOperator.getRoundFromChain(currentEpoch - 1);
            await this.db.diceRepo.upsertDocumentData(liveRound.epoch.toString(), liveRound);
        }
    }

    async validateRoundInDb() {
        const rounds = await this.db.diceRepo.getCollectionDataByConditions([
            {
                field: 'cancel',
                operator: '==',
                value: false,
            },
        ]);

        if (rounds) {
            for (const r of rounds) {
                const round = await this.diceOperator.getRoundFromChain(r.epoch);
                await this.db.diceRepo.upsertDocumentData(round.epoch.toString(), round);
            }
        }
    }

    async cancelCurrentRound() {
        const currentRounds = await this.db.diceRepo.getCollectionDataByConditions([
            {
                field: 'closed',
                operator: '==',
                value: false,
            },
            {
                field: 'cancel',
                operator: '==',
                value: false,
            },
        ]);

        if (currentRounds) {
            for (const round of currentRounds) {
                await this.db.diceRepo.upsertDocumentData(round.epoch.toString(), {
                    cancel: true,
                });
            }
        }
    }

    async updateDicePreference() {
        const preference: Preferences = {
            fee: null,
            genesis_start: null,
            interval_seconds: null,
            paused: null,
        };

        const genesisStart = await this.diceOperator.isGenesisStart();

        const genesisEnd = await this.diceOperator.isGenesisEnd();

        const intervalSeconds = Number(await this.diceOperator.getIntervalSecond());

        const treasuryFee = Number(await this.diceOperator.getTreasuryFee());

        const paused = await this.diceOperator.isPaused();

        if (genesisStart !== undefined) {
            preference.genesis_start = genesisStart;
        }

        if (genesisEnd !== undefined) {
            preference.genesis_end = genesisEnd;
        }

        if (paused !== undefined) {
            preference.paused = paused;
        }

        if (intervalSeconds !== undefined) {
            preference.interval_seconds = parseInt(intervalSeconds.toString());
        }

        if (treasuryFee !== undefined) {
            preference.fee = parseInt(treasuryFee.toString());
        }

        await this.db.preferenceRepo.upsertDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.DICE, preference);
    }
}
