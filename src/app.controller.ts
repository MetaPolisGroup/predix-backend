/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Get, OnApplicationBootstrap, Param } from '@nestjs/common';
import { IDataServices } from './core/abstract/data-services/data-service.abstract';
import { UserAuthenService } from './use-case/user/user-authen.service';
import { ContractFactoryAbstract } from './core/abstract/contract-factory/contract-factory.abstract';
import { LeaderboardService } from './use-case/leaderboard/leader.service';
import { PredixOperatorContract } from './use-case/contracts/predix/prediction-operator.service';
import { HelperService } from './use-case/helper/helper.service';
import { WalletService } from './use-case/wallet/wallet.service';
import { PredixFakeBotService } from './consumer/bots/prediction/predix-fake-bot.service';
import { FaucetService } from './use-case/faucet/faucet.service';
import { NativeTokenService } from './use-case/token/native-token/native-token.service';
import { PredixBotContract } from './use-case/contracts/predix/prediction-bot.service';
import { PredictionRoundService } from './use-case/games/prediction/prediction-round.service';
import { PredixStatisticService } from './use-case/statistic/predix/predix-statistic.service';
import { ManipulationService } from './use-case/manipulation/manipulation.service';
import { ManipulationUsecases } from './use-case/manipulation/manipulation.usecases';
import { BetPredictionService } from './use-case/bet/prediction/bet-prediction.service';

@Controller()
export class AppController implements OnApplicationBootstrap {
    constructor(
        private readonly userService: UserAuthenService,
        private readonly factory: ContractFactoryAbstract,
        private readonly leaderboard: LeaderboardService,
        private readonly prediction: PredixOperatorContract,
        private readonly predixRound: PredictionRoundService,
        private readonly helper: HelperService,
        private readonly walletService: WalletService,
        private readonly predixStatistic: PredixStatisticService,
        private readonly predixManipulate: ManipulationService,
        private readonly predixManipulateUsecase: ManipulationUsecases,

        private readonly predixFakeBot: PredixFakeBotService,
        private readonly predixBot: PredixBotContract,
        private readonly nativeToken: NativeTokenService,
        private readonly faucetService: FaucetService,
        private readonly db: IDataServices,
    ) {}

    onApplicationBootstrap() {}

    @Get('clearBet')
    async clearBetsToday() {
        const bets = await this.db.betRepo.getCollectionDataByConditions([
            {
                field: 'created_at',
                operator: '>=',
                value: this.helper.getTimestampAtBeginningOfDayInSeconds(),
            },
        ]);

        for (const bet of bets) {
            await this.db.betRepo.deleteDocumentData(bet.id);
        }
    }

    @Get('clearRound')
    async clearRoundsToday() {
        const rounds = await this.db.predictionRepo.getCollectionDataByConditions([
            {
                field: 'created_at',
                operator: '>=',
                value: this.helper.getTimestampAtBeginningOfDayInSeconds(),
            },
        ]);

        for (const round of rounds) {
            await this.db.predictionRepo.deleteDocumentData(round.id);
        }
    }

    @Get('getBet/:epoch')
    async getBetsByEpoch(@Param('epoch') epoch: number) {
        const bets = await this.db.betRepo.getCollectionDataByConditions([
            {
                field: 'round.epoch',
                operator: '==',
                value: epoch,
            },
        ]);

        return bets;
    }

    @Get('bot')
    async bot() {
        const round = await this.predixRound.getCurrentRound();
        this.predixFakeBot.runFakeBots(round, 1);
    }

    @Get('botbear/:amount')
    async botbear(@Param('amount') amount: string) {
        const round = await this.predixRound.getCurrentRound();
        this.predixFakeBot.botBetBear(round, +amount);
    }

    @Get('botbull/:amount')
    async botbull(@Param('amount') amount: string) {
        const round = await this.predixRound.getCurrentRound();
        this.predixFakeBot.botBetBull(round, +amount);
    }

    @Get('getRound/:id')
    async set(@Param('id') round: string) {
        return this.db.predictionRepo.getDocumentData(round);
    }

    @Get('statistic')
    async statistic() {
        return this.predixStatistic.getCurrentStatistic();
    }

    @Get('mani/:epoch')
    async getManipulation(@Param('epoch') epoch: number) {
        return this.predixManipulateUsecase.getManipulationByEpoch(epoch);
    }
}
