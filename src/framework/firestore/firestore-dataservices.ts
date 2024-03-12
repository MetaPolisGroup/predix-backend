import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import * as admin from "firebase-admin"
import { Bucket } from '@google-cloud/storage';
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
import { Preferences } from 'src/core/entity/preferences.entity';
import { Market } from 'src/core/entity/market.entity';
import { Dice } from 'src/core/entity/dice.entity';

@Injectable()
export class FirestoreDataServices implements IDataServices, OnApplicationBootstrap {
  //Firestore
  firestore: admin.firestore.Firestore;

  userRepo: FirestoreGenericRepository<User>;

  chartRepo: FirestoreGenericRepository<Chart>;

  cashHistoryRepoRepo: FirestoreGenericRepository<CashHistory>;

  pointHistoryRepo: FirestoreGenericRepository<PointHistory>;

  productRepo: FirestoreGenericRepository<Product>;

  cashHistoryRepo: FirestoreGenericRepository<CashHistory>;

  chainlinkRepo: FirestoreGenericRepository<Chainlink>;

  leaderboardRepo: FirestoreGenericRepository<Leaderboard>;

  preferenceRepo: FirestoreGenericRepository<Preferences>;

  // Prediction

  predictionRepo: FirestoreGenericRepository<Prediction>;

  betRepo: FirestoreGenericRepository<Bet>;

  // Dice
  diceRepo: FirestoreGenericRepository<Dice>;

  betDiceRepo: FirestoreGenericRepository<Bet>;

  // Market
  betMarketRepo: FirestoreGenericRepository<Bet>;

  marketRepo: FirestoreGenericRepository<Market>;

  constructor() { }

  onApplicationBootstrap(): void {

    // Initialize DB
    const serviceAccount = this.getServiceAccount()
    const app = admin.initializeApp(
      {
        credential: admin.credential.cert(serviceAccount),
        storageBucket: constant.STORAGE.BUCKET,
      },
      constant.FIREBASE.NAME,
    );
    const firestore = app.firestore();
    firestore.settings({ ignoreUndefinedProperties: true });
    const bucket: Bucket = app.storage().bucket();

    //Firestore
    this.firestore = firestore;

    // Repositories
    this.userRepo = new FirestoreGenericRepository<User>(firestore, constant.FIREBASE.COLLECTIONS.USERS);

    this.cashHistoryRepoRepo = new FirestoreGenericRepository<CashHistory>(firestore, constant.FIREBASE.COLLECTIONS.CASH_HISTORIES);

    this.pointHistoryRepo = new FirestoreGenericRepository<PointHistory>(firestore, constant.FIREBASE.COLLECTIONS.POINT_HISTORIES);

    this.productRepo = new FirestoreGenericRepository<Product>(firestore, constant.FIREBASE.COLLECTIONS.PRODUCTS);

    this.chartRepo = new FirestoreGenericRepository<Chart>(firestore, constant.FIREBASE.COLLECTIONS.CHARTS);

    this.chainlinkRepo = new FirestoreGenericRepository<Chainlink>(firestore, constant.FIREBASE.COLLECTIONS.CHAINLINKS);

    this.leaderboardRepo = new FirestoreGenericRepository<Leaderboard>(firestore, constant.FIREBASE.COLLECTIONS.LEADERBOARD);

    this.preferenceRepo = new FirestoreGenericRepository<Preferences>(firestore, constant.FIREBASE.COLLECTIONS.PREFERENCES);

    // Prediction

    this.predictionRepo = new FirestoreGenericRepository<Prediction>(firestore, constant.FIREBASE.COLLECTIONS.PREDICTIONS);

    this.betRepo = new FirestoreGenericRepository<Bet>(firestore, constant.FIREBASE.COLLECTIONS.BETS);

    // Dice
    this.diceRepo = new FirestoreGenericRepository<Dice>(firestore, constant.FIREBASE.COLLECTIONS.DICES);

    this.betDiceRepo = new FirestoreGenericRepository<Bet>(firestore, constant.FIREBASE.COLLECTIONS.BETS_DICE);
    // Market

    this.betMarketRepo = new FirestoreGenericRepository<Bet>(firestore, constant.FIREBASE.COLLECTIONS.BETS_MARKET);

    this.marketRepo = new FirestoreGenericRepository<Market>(firestore, constant.FIREBASE.COLLECTIONS.MARKETS);
  }


  private getServiceAccount() {

    const serviceAccount: admin.ServiceAccount = {
      projectId: process.env.FIRESTORE_PROJECT_ID,
      privateKey: process.env.FIRESTORE_PRIVATE_KEY
        ? process.env.FIRESTORE_PRIVATE_KEY.replace(/\\n/gm, "\n")
        : undefined,
      clientEmail: process.env.FIRESTORE_CLIENT_EMAIL,
    };

    return serviceAccount

  }
}
