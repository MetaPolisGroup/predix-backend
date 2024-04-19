import { Injectable, OnApplicationBootstrap, OnModuleInit } from '@nestjs/common';
import constant from 'src/configuration';
import { ILoggerFactory } from 'src/core/abstract/logger/logger-factory.abstract';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';
import { Prediction } from 'src/core/entity/prediction.enity';
import { Wallet } from 'src/core/entity/wallet.entity';
import { CronJob } from 'src/core/types/cronjob.type';
import { HelperService } from 'src/use-case/helper/helper.service';
import { PredixBotContract } from 'src/use-case/contracts/predix/prediction-bot.service';
import { PredictionRoundService } from 'src/use-case/games/prediction/prediction-round.service';
import { NativeTokenService } from 'src/use-case/token/native-token/native-token.service';
import { PreTokenService } from 'src/use-case/token/pre-token/pre-token.service';
import { WalletService } from 'src/use-case/wallet/wallet.service';
import { BotUserService } from 'src/use-case/user/bot/bot-user.service';

@Injectable()
export class PredixFakeBotService implements OnApplicationBootstrap {
    private readonly logger: ILogger;

    private readonly cronJobsBet: { [id: string]: CronJob } = {};

    private readonly secondBeforeLock = 20;

    private readonly betRange = {
        from: 10,
        to: 40,
    };

    private readonly betTimes = {
        from: 2,
        to: 5,
    };

    constructor(
        private readonly helper: HelperService,
        private readonly predixRoundService: PredictionRoundService,
        private readonly predixBotContract: PredixBotContract,
        private readonly fakeBotUser: BotUserService,
        private readonly walletService: WalletService,
        private readonly nativeTokenService: NativeTokenService,
        private readonly preTokenService: PreTokenService,
        private readonly loggerFactory: ILoggerFactory,
    ) {
        this.logger = this.loggerFactory.predictionLogger;
    }

    async onApplicationBootstrap() {}

    async runFakeBots(round: Prediction, times: number, index = 1) {
        if (index > times) {
            return;
        }

        const botWallets = await this.walletService.getAllBotWallets();
        const { status, wallet, message } = await this.pickARandomAvailableBotWallet(
            botWallets,
            round.lockTimestamp - this.secondBeforeLock,
        );

        if (status === 0) {
            this.logger.warn(message);
            return;
        }

        this.schedulesBetAtRndTimeAndRndBetAmount(wallet, round.epoch, round.lockTimestamp - this.secondBeforeLock);

        await this.runFakeBots(round, times, index + 1);
    }

    FakeUserBet({ lockTimestamp, epoch }: Prediction) {
        const now = this.helper.getNowTimeStampsSeconds();
        if (now > lockTimestamp) {
            return;
        }
        this.predixBotContract.safeBetBearByPrivatekey(
            {
                address: '0xbC83e41b3C20593095B3c6b89625bB1eF6a6Df4e',
                privateKey: 'b9f41189480eb483895469f79583755bdd35a5bcfe6077581fb70f4c31973211',
            } as Wallet,
            epoch,
            this.helper.randomNumber(this.betRange.from, this.betRange.to),
        );
        this.predixBotContract.safeBetBullByPrivatekey(
            {
                address: '0x3AA2d475633d91b375eb68D95EB62BCf636A1C74',
                privateKey: '4420c3c1829b186f14fea2e7d85f8a3cee95bad40d7cfd973cbebcd36753bd39',
            } as Wallet,
            epoch,
            this.helper.randomNumber(this.betRange.from, this.betRange.to),
        );
    }

    // Schedule

    schedulesBetAtRndTimeAndRndBetAmount(wallet: Wallet, epoch: number, lockTimestamp: number) {
        const betDate = this.helper.getRandomDateFromNowTo(lockTimestamp);
        const betAmount = this.helper.randomNumber(this.betRange.from, this.betRange.to);

        this.schedulesBet(wallet, betAmount, betDate, epoch);
    }

    async schedulesBetAtRandomTimeInCurrentRound(wallet: Wallet, betAmount: number) {
        const { epoch, lockTimestamp } = await this.predixRoundService.getCurrentRound();
        const nowTimestamp = this.helper.getNowTimeStampsSeconds();
        const betTimestamp = lockTimestamp - this.secondBeforeLock;

        if (betTimestamp < nowTimestamp) {
            this.logger.log('Bet overtime');
            return;
        }

        const betDate = this.helper.getRandomDateFromTo(nowTimestamp, betTimestamp);

        this.schedulesBet(wallet, betAmount, betDate, epoch);
    }

    schedulesBet(wallet: Wallet, betAmount: number, betDate: Date, epoch: number) {
        this.cronJobsBet[wallet.address] = this.helper.createCronJob(
            () =>
                this.logger.log(
                    `Fake bot Predix for round ${epoch} have been scheduled at ${betDate.getHours()}:${betDate.getMinutes()}:${betDate.getSeconds()}`,
                ),
            betDate,
            async () => {
                await this.processBet(wallet, epoch, betAmount);
                this.cronJobsBet[wallet.address].running = false;
            },
        );
    }

    // Temp for test purposes
    async botBetBear(round: Prediction, amount: number) {
        const botWallets = await this.walletService.getAllBotWallets();
        const { status, wallet } = await this.pickARandomAvailableBotWallet(
            botWallets,
            round.lockTimestamp - this.secondBeforeLock,
        );
        if (status === 0) {
            return;
        }
        await this.predixBotContract.safeBetBearByPrivatekey(wallet, round.epoch, amount);
    }

    async botBetBull(round: Prediction, amount: number) {
        const botWallets = await this.walletService.getAllBotWallets();
        const { status, wallet } = await this.pickARandomAvailableBotWallet(
            botWallets,
            round.lockTimestamp - this.secondBeforeLock,
        );
        if (status === 0) {
            return;
        }
        await this.predixBotContract.safeBetBullByPrivatekey(wallet, round.epoch, amount);
    }

    private async processBet(wallet: Wallet, epoch: number, amount: number) {
        const chance = Math.floor(Math.random() * 2);
        if (chance > 0) {
            await this.predixBotContract.safeBetBearByPrivatekey(wallet, epoch, amount);
            return;
        }

        await this.predixBotContract.safeBetBullByPrivatekey(wallet, epoch, amount);
    }

    async pickARandomAvailableBotWallet(
        botWallets: Wallet[],
        lockTimestamp: number,
    ): Promise<{
        status: 1 | 0;
        message: string;
        wallet: Wallet | null;
    }> {
        const now = this.helper.getNowTimeStampsSeconds();
        if (now > lockTimestamp) {
            return {
                status: 0,
                message: 'Bet over time',
                wallet: null,
            };
        }

        const randomBotWallet = botWallets[this.helper.randomNumber(0, botWallets.length - 1)];

        if (!randomBotWallet) {
            return {
                status: 0,
                message: 'Get wallet failed',
                wallet: null,
            };
        }

        if (!(await this.isBotWalletAvailable(randomBotWallet))) {
            return this.pickARandomAvailableBotWallet(botWallets, lockTimestamp);
        }

        return { status: 1, wallet: randomBotWallet, message: '' };
    }

    async isBotWalletAvailable(wallet: Wallet) {
        const { address, approve_request, eth_refund_request, token_refund_request } = wallet;
        const isIdle =
            !eth_refund_request && !token_refund_request && !approve_request && !this.cronJobsBet?.[address]?.running;

        if (!isIdle) {
            return false;
        }
        const isEnoughNativeToken = await this.nativeTokenService.isEnoughEth(
            address,
            constant.BOT.FAKEBOT.MIN_ETH_BUDGET,
        );

        if (!isEnoughNativeToken) {
            this.walletService.requestEthRefund(address);
            return false;
        }

        const isEnoughPreToken = await this.preTokenService.isEnoughToken(
            address,
            constant.BOT.FAKEBOT.MIN_TOKEN_BUDGET,
        );

        if (!isEnoughPreToken) {
            this.walletService.requestTokenRefund(address);
            return false;
        }
        const isEnoughAllowance = await this.preTokenService.isEnoughAllowance(
            address,
            constant.BOT.FAKEBOT.MIN_TOKEN_BUDGET,
        );

        if (!isEnoughAllowance) {
            this.walletService.requestApproval(address);
            return false;
        }

        return true;
    }
}
