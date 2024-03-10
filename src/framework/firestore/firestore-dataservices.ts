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
    // const serviceAccount: admin.ServiceAccount = {
    //   projectId: "predix-reborn",
    //   privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDHHF0jS8+8/ieP\nKt0QVmaCU7LysCyJCs+LCBEHeRzosQZiclX8Snq35HukhoN8jkBep1JnQLmu1Ipe\nLvC99MLFFNmYn0vdEPqdx58zB8QzoBcoESt7mCfTcBzmKReA/EAu81ie5nbicYZE\nNMIeaYrBQ9Pcy9iuc1aU3dnhF1amhBcxa2x8f+khvUgCkKCDBMOxiUjb2UxaCP+g\nu762ve+7twn7EY65/kll+A7CfLe/hmBA7wvm38MIHB7n23SHsUwnlvi+UfS0UrPO\nqv3YCLxluZt7Oyij2TdryKW2tgWJSx2NDVkkQ+ldIvgJflF36sdcPNibuhG1pR+u\nRnl87Ua1AgMBAAECggEAEks7dEW/5Xs4gtskvbgig2QegFVj3u3pjO2fZ7j4YszF\n0f/AgYVz6jdwJyxD7z3zd7IWsrpSSFgdpAx0cNxVlN2W8ukX6eZodsMWw0DtOI0Q\nWgCrc345LCBHfdu8RBnPgw2d6j0xVebct9TDgFKg8NbcvWAHtyeNU4ot1y3zKsNO\n/aymYjMV+oZiVCpY/8ul+RfubclptyDWbDFtgzMVO7WK8cT2KF3Uiv9DvyWTRbew\nrJi/SQ+++6fGYysdVOJSLvtN4+eor8vMB7QTQQGm5XvExtGnqynCQX3PBf7TVqhC\ngZpgm3ucK1Dxdw9xe9OfKq2PwThsWZr9jvYnJEULFQKBgQDvr2L36eOEmPaa6mMk\n2C05+Jo3C2dOSybDIQ0DPzMWk5LJAAw9HSejZcDb+dTLuE+10HJ4aXx9OHh/7f5s\n2PmYE7Mw5lm2CdLCv5wOfjQktvJVK4xMC/rU87BEm5+6bE2fAjqx4ju8HOtQ3StW\n7mAccIHtgLe1Vx11wV+xIyB7CwKBgQDUqfPxksLRl+eOE980tlGo1DCoFTUSkeQ8\nkvCRC1eBdzQeP9+lJAc9DA0tzPHdAgc+r4S8S5wfNRcdkjl0FDCyxbn1tV1Yi/zI\nGqS5yXhsjugIwAGkqw8OF3beS57Cznk5HNDgMzOzkUWSv69kRxYQ8+ELYjkLfvaC\nr6HyRzRdPwKBgQC12mBAsRiKtnQEvelTPyGxZkm7kc9ju+lBC4aP/BeK/ZTVJFAk\n3kYA12cof7lQiBsSW4E+kup9J6dliPENLOLS27+NTniqgXGDiVWiOWbepF/g9xWP\nbVd20x3eMCVUkG+kQVC/PmMMKvTveZ80adBKQ6KQzKSV1e7oNTuhboFqWQKBgFoh\nrcI08VzjhMAyq+crXnCvfe+/DT9RleoWXN8cb3nvi6dGawMSwf6dnPhMZDXHJkrr\nGNa1NPYFCkb+MluAMyORqb75nxZoPjqRED+to9xetPkAZ7Hizf6q8zZD1oW5/Ka4\nD8715HO2nkYT98IIXtHQixDIEGVO6it5RKnqg8cBAoGBAL6S7JKxa7VfGPaGj2wf\nAZWDmca5OZHp/7Rmj969LKXIIP03G3Q6TcrF9/1CtynejPfLmLH5UpxlOwx1BF0Q\nSa99FeGWXKUvFw4nCnVx7R30nxtDMMjRs7UH9Wbf2ErQLBjaxj2FyZIsWSNzgUpr\nAmQuwG2ADVUl4N6078Bq0jsE\n-----END PRIVATE KEY-----\n",

    //   clientEmail: "firebase-adminsdk-k8nfe@predix-reborn.iam.gserviceaccount.com",
    // };
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
