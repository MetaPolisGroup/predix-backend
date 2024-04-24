import { Injectable, OnModuleInit } from '@nestjs/common';
import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { Firestore, getFirestore } from 'firebase-admin/firestore';

import constant from 'src/configuration';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { User } from 'src/core/entity/user.enity';
import { FirestoreGenericRepository } from './firestore-generic-repository';
import { CashHistory } from 'src/core/entity/cash-history.enity';
import { PointHistory } from 'src/core/entity/point-history.enity';
import { Prediction } from 'src/core/entity/prediction.enity';
import { Product } from 'src/core/entity/product.entiy';
import { Bet } from 'src/core/entity/bet.entity';
import { Chainlink } from 'src/core/entity/chainlink.entity';
import { Leaderboard } from 'src/core/entity/leaderboard.entity';
import { Chart } from 'src/core/entity/chart.entity';
import { BotPreferences, Preferences } from 'src/core/entity/preferences.entity';
import { Market } from 'src/core/entity/market.entity';
import { Dice } from 'src/core/entity/dice.entity';
import { Wallet } from 'src/core/entity/wallet.entity';
import { Statistic } from 'src/core/entity/statistic.entity';
import { Manipulation } from 'src/core/entity/manipulation.entity';
import { CommissionRecord } from 'src/core/entity/commission-record.entity';

@Injectable()
export class FirestoreDataServices implements IDataServices, OnModuleInit {
    //Firestore
    firestore: Firestore;

    userRepo: FirestoreGenericRepository<User>;

    commissionRecordRepo: FirestoreGenericRepository<CommissionRecord>;

    chartRepo: FirestoreGenericRepository<Chart>;

    cashHistoryRepoRepo: FirestoreGenericRepository<CashHistory>;

    pointHistoryRepo: FirestoreGenericRepository<PointHistory>;

    productRepo: FirestoreGenericRepository<Product>;

    cashHistoryRepo: FirestoreGenericRepository<CashHistory>;

    chainlinkRepo: FirestoreGenericRepository<Chainlink>;

    leaderboardRepo: FirestoreGenericRepository<Leaderboard>;

    preferenceRepo: FirestoreGenericRepository<Preferences>;

    botPreferenceRepo: FirestoreGenericRepository<BotPreferences>;

    walletRepo: FirestoreGenericRepository<Wallet>;

    statisticRepo: FirestoreGenericRepository<Statistic>;

    manipulationRepo: FirestoreGenericRepository<Manipulation>;
    // Prediction

    predictionRepo: FirestoreGenericRepository<Prediction>;

    betRepo: FirestoreGenericRepository<Bet>;

    // Dice
    diceRepo: FirestoreGenericRepository<Dice>;

    betDiceRepo: FirestoreGenericRepository<Bet>;

    // Market
    betMarketRepo: FirestoreGenericRepository<Bet>;

    marketRepo: FirestoreGenericRepository<Market>;

    constructor() {}

    onModuleInit(): void {
        // Initialize DB
        const serviceAccount = this.getServiceAccount();
        const app = initializeApp(
            {
                credential: cert(serviceAccount),
                storageBucket: constant.STORAGE.BUCKET,
            },
            constant.FIREBASE.NAME,
        );
        const firestore = getFirestore(app);
        firestore.settings({ ignoreUndefinedProperties: true });

        //Firestore
        this.firestore = firestore;

        // Repositories
        this.userRepo = new FirestoreGenericRepository<User>(firestore, constant.FIREBASE.COLLECTIONS.USERS);

        this.commissionRecordRepo = new FirestoreGenericRepository<CommissionRecord>(
            firestore,
            constant.FIREBASE.COLLECTIONS.COMMISSION_RECORDS,
        );

        this.cashHistoryRepoRepo = new FirestoreGenericRepository<CashHistory>(
            firestore,
            constant.FIREBASE.COLLECTIONS.CASH_HISTORIES,
        );

        this.pointHistoryRepo = new FirestoreGenericRepository<PointHistory>(
            firestore,
            constant.FIREBASE.COLLECTIONS.POINT_HISTORIES,
        );

        this.productRepo = new FirestoreGenericRepository<Product>(firestore, constant.FIREBASE.COLLECTIONS.PRODUCTS);

        this.chartRepo = new FirestoreGenericRepository<Chart>(firestore, constant.FIREBASE.COLLECTIONS.CHARTS);

        this.chainlinkRepo = new FirestoreGenericRepository<Chainlink>(
            firestore,
            constant.FIREBASE.COLLECTIONS.CHAINLINKS,
        );

        this.leaderboardRepo = new FirestoreGenericRepository<Leaderboard>(
            firestore,
            constant.FIREBASE.COLLECTIONS.LEADERBOARD,
        );

        this.preferenceRepo = new FirestoreGenericRepository<Preferences>(
            firestore,
            constant.FIREBASE.COLLECTIONS.PREFERENCES,
        );

        this.botPreferenceRepo = new FirestoreGenericRepository<BotPreferences>(
            firestore,
            constant.FIREBASE.COLLECTIONS.BOT_PREFERENCES,
        );

        this.walletRepo = new FirestoreGenericRepository<Wallet>(firestore, constant.FIREBASE.COLLECTIONS.WALLETS);

        this.statisticRepo = new FirestoreGenericRepository<Statistic>(
            firestore,
            constant.FIREBASE.COLLECTIONS.STATISTICS,
        );

        this.manipulationRepo = new FirestoreGenericRepository<Manipulation>(
            firestore,
            constant.FIREBASE.COLLECTIONS.MANIPULATIONS,
        );

        // Prediction

        this.predictionRepo = new FirestoreGenericRepository<Prediction>(
            firestore,
            constant.FIREBASE.COLLECTIONS.PREDICTIONS,
        );

        this.betRepo = new FirestoreGenericRepository<Bet>(firestore, constant.FIREBASE.COLLECTIONS.BETS);

        // Dice
        this.diceRepo = new FirestoreGenericRepository<Dice>(firestore, constant.FIREBASE.COLLECTIONS.DICES);

        this.betDiceRepo = new FirestoreGenericRepository<Bet>(firestore, constant.FIREBASE.COLLECTIONS.BETS_DICE);
        // Market

        this.betMarketRepo = new FirestoreGenericRepository<Bet>(firestore, constant.FIREBASE.COLLECTIONS.BETS_MARKET);

        this.marketRepo = new FirestoreGenericRepository<Market>(firestore, constant.FIREBASE.COLLECTIONS.MARKETS);
    }

    private getServiceAccount() {
        const serviceAccount: ServiceAccount = {
            projectId: process.env.FIRESTORE_PROJECT_ID,
            privateKey: process.env.FIRESTORE_PRIVATE_KEY
                ? process.env.FIRESTORE_PRIVATE_KEY.replace(/\\n/gm, '\n')
                : undefined,
            clientEmail: process.env.FIRESTORE_CLIENT_EMAIL,
        };

        return serviceAccount;
    }
}
