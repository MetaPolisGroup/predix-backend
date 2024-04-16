import { Module } from '@nestjs/common';
import { PredictionSnapshotService } from './prediction/prediction.snapshot';
import { PredictionModule } from '../../use-case/games/prediction/prediction.module';
import { DiceModule } from '../../use-case/games/dice/dice.module';
import { ContractFactoryModule } from 'src/service/contract-factory/contract-factory.module';
import { LeaderboardModule } from '../../use-case/leaderboard/leaderboard.module';
import { BotsModule } from '../bots/bots.module';
import { TokenModule } from '../../use-case/token/token.module';
import { WalletModule } from '../../use-case/wallet/wallet.module';
import { FaucetModule } from '../../use-case/faucet/faucet.module';
import { WalletRequestsSnapshot } from './wallet/request/wallet-requests.snapshot';
import { WalletSnapshotCenter } from './wallet/wallet.snapshot-center';
import { StatisticModule } from '../../use-case/statistic/statistic.module';
import { ManipulationSnapshotService } from './manipulation/predix/manipulation.snapshot';
import { PredixBetSnapshotService } from './bet/predix-bet/predix-bet.snapshot';
import { ManipulationModule } from '../../use-case/manipulation/manipulation.module';
import { UserModule } from '../../use-case/user/user.module';
import { BetModule } from '../../use-case/bet/bet.module';

@Module({
    providers: [
        // Leaderboardl
        // LeaderboardSnapshotService,

        // Predix
        PredictionSnapshotService,

        // bet
        PredixBetSnapshotService,

        // Wallet
        WalletSnapshotCenter,
        WalletRequestsSnapshot,

        // Manipulation
        ManipulationSnapshotService,

        // Preference
        // PreferenceSnapshotService,

        // Dice
        // DiceSnapshotService,
    ],
    controllers: [],
    imports: [
        ContractFactoryModule,
        PredictionModule,
        DiceModule,
        LeaderboardModule,
        BotsModule,
        TokenModule,
        WalletModule,
        StatisticModule,
        FaucetModule,
        ManipulationModule,
        UserModule,
        BetModule,
    ],
    exports: [],
})
export class SnapshotModule {}
