import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirestoreGenericRepository } from './firestore-generic-repository';
import { IDataServices } from 'src/core/abstracts/data-services/data-service.abstract';
import {
  user,
  betSport,
  league,
  match,
  odd,
  partner,
  notification,
  ticket,
  preferences,
  log,
  image,
  sport,
  minigame,
  administrator,
  cashHistory,
  SportsRules,
  CoinPowerballRules,
  LadderRules,
  alertNotification,
  VirtualGameRules,
} from 'src/core/entities';
import { FirestoreTicketRepository } from './ticket/ticketRepo-extend';
import { FirebaseGenericStorage } from './storage/firebase-storage-generic';
import { Bucket } from '@google-cloud/storage';
import constant from 'src/configuration';
import { country } from 'src/core/entities/country.entity';
import { team } from 'src/core/entities/team.entity';
import { betMiniGame } from 'src/core/entities/bet-mini-game.entity';
import { pointhistory } from 'src/core/entities/point-history.entity';
import { editHistory } from 'src/core/entities/edit-history.entity';
import { oddType } from 'src/core/entities/odd-type.entity';
import { settlement } from 'src/core/entities/settlement.entity';
import { raceVirtualGame, soccerVirtualGame } from 'src/core/entities/bet-virtual-game.entity';
import { virtualGame } from 'src/core/entities/virtual-game.entity';
import { serviceAccount } from './service-account';

@Injectable()
export class FirestoreDataServices implements IDataServices, OnApplicationBootstrap {
  //Firestore
  firestore: admin.firestore.Firestore;

  //Repos
  usersRepo: FirestoreGenericRepository<user>;

  betsSportRepo: FirestoreGenericRepository<betSport>;

  betsMinigameRepo: FirestoreGenericRepository<betMiniGame>;

  leaguesRepo: FirestoreGenericRepository<league>;

  matchesRepo: FirestoreGenericRepository<match>;

  oddsRepo: FirestoreGenericRepository<odd>;

  partnersRepo: FirestoreGenericRepository<partner>;

  adminsRepo: FirestoreGenericRepository<administrator>;

  notificationsRepo: FirestoreGenericRepository<notification>;

  alertNotificationsRepo: FirestoreGenericRepository<alertNotification>;

  ticketsRepo: FirestoreTicketRepository<ticket>;

  preferencesRepo: FirestoreGenericRepository<preferences>;

  logsRepo: FirestoreGenericRepository<log>;

  imagesRepo: FirestoreGenericRepository<image>;

  countriesRepo: FirestoreGenericRepository<country>;

  teamsRepo: FirestoreGenericRepository<team>;

  sportsRepo: FirestoreGenericRepository<sport>;

  minigamesRepo: FirestoreGenericRepository<minigame>;

  betMiniGamesRepo: FirestoreGenericRepository<betMiniGame>;

  pointHistoryRepo: FirestoreGenericRepository<pointhistory>;

  editHistoriesRepo: FirestoreGenericRepository<editHistory>;

  cashHistoriesRepo: FirestoreGenericRepository<cashHistory>;

  oddTypeRepo: FirestoreGenericRepository<oddType>;

  sportRuleRepo: FirestoreGenericRepository<SportsRules>;

  coinPowerballRuleRepo: FirestoreGenericRepository<CoinPowerballRules>;

  ladderRuleRepo: FirestoreGenericRepository<LadderRules>;

  virtualGameRuleRepo: FirestoreGenericRepository<VirtualGameRules>;

  settlementRepo: FirestoreGenericRepository<settlement>;

  soccerVirtualGameRepo: FirestoreGenericRepository<soccerVirtualGame>;

  raceVirtualGameRepo: FirestoreGenericRepository<raceVirtualGame>;

  virtualGameRepo: FirestoreGenericRepository<virtualGame>;

  // Storage

  templateStorage: FirebaseGenericStorage;

  announcementStorage: FirebaseGenericStorage;

  eventStorage: FirebaseGenericStorage;

  bettingRulesStorage: FirebaseGenericStorage;

  popupStorage: FirebaseGenericStorage;

  otherStorage: FirebaseGenericStorage;

  nationsStorage: FirebaseGenericStorage;

  constructor() {}

  onApplicationBootstrap(): void {
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

    // Storages
    this.templateStorage = new FirebaseGenericStorage(bucket, constant.STORAGE_PATH.TEMPLATE);
    this.announcementStorage = new FirebaseGenericStorage(bucket, constant.STORAGE_PATH.ANNOUNCEMENT);
    this.eventStorage = new FirebaseGenericStorage(bucket, constant.STORAGE_PATH.EVENT);
    this.bettingRulesStorage = new FirebaseGenericStorage(bucket, constant.STORAGE_PATH.BETTING_RULES);
    this.popupStorage = new FirebaseGenericStorage(bucket, constant.STORAGE_PATH.POPUP);
    this.otherStorage = new FirebaseGenericStorage(bucket, constant.STORAGE_PATH.OTHER);
    this.nationsStorage = new FirebaseGenericStorage(bucket, constant.STORAGE_PATH.NATIONS);

    // Repositories
    this.usersRepo = new FirestoreGenericRepository<user>(firestore, constant.FIREBASE.COLLECTIONS.USERS);
    this.betsSportRepo = new FirestoreGenericRepository<betSport>(firestore, constant.FIREBASE.COLLECTIONS.BETS);
    this.betsMinigameRepo = new FirestoreGenericRepository<betMiniGame>(firestore, constant.FIREBASE.COLLECTIONS.BETS);
    this.leaguesRepo = new FirestoreGenericRepository<league>(firestore, constant.FIREBASE.COLLECTIONS.LEAGUES);
    this.matchesRepo = new FirestoreGenericRepository<match>(firestore, constant.FIREBASE.COLLECTIONS.MATCHES);
    this.oddsRepo = new FirestoreGenericRepository<odd>(firestore, constant.FIREBASE.COLLECTIONS.ODDS);
    this.partnersRepo = new FirestoreGenericRepository<partner>(firestore, constant.FIREBASE.COLLECTIONS.PARTNERS);
    this.adminsRepo = new FirestoreGenericRepository<administrator>(firestore, constant.FIREBASE.COLLECTIONS.ADMINS);
    this.ticketsRepo = new FirestoreTicketRepository<ticket>(firestore, constant.FIREBASE.COLLECTIONS.TICKETS);
    this.notificationsRepo = new FirestoreGenericRepository<notification>(firestore, constant.FIREBASE.COLLECTIONS.NOTIFICATIONS);
    this.alertNotificationsRepo = new FirestoreGenericRepository<alertNotification>(firestore, constant.FIREBASE.COLLECTIONS.NOTIFICATIONS);
    this.preferencesRepo = new FirestoreGenericRepository<preferences>(firestore, constant.FIREBASE.COLLECTIONS.PREFERENCES);
    this.sportRuleRepo = new FirestoreGenericRepository<SportsRules>(firestore, constant.FIREBASE.COLLECTIONS.PREFERENCES);
    this.coinPowerballRuleRepo = new FirestoreGenericRepository<CoinPowerballRules>(firestore, constant.FIREBASE.COLLECTIONS.PREFERENCES);
    this.ladderRuleRepo = new FirestoreGenericRepository<LadderRules>(firestore, constant.FIREBASE.COLLECTIONS.PREFERENCES);
    this.virtualGameRuleRepo = new FirestoreGenericRepository<VirtualGameRules>(firestore, constant.FIREBASE.COLLECTIONS.PREFERENCES);
    this.logsRepo = new FirestoreGenericRepository<log>(firestore, constant.FIREBASE.COLLECTIONS.LOGS);
    this.imagesRepo = new FirestoreGenericRepository<image>(firestore, constant.FIREBASE.COLLECTIONS.IMAGES);
    this.countriesRepo = new FirestoreGenericRepository<country>(firestore, constant.FIREBASE.COLLECTIONS.COUNTRIES);
    this.teamsRepo = new FirestoreGenericRepository<team>(firestore, constant.FIREBASE.COLLECTIONS.TEAMS);
    this.sportsRepo = new FirestoreGenericRepository<sport>(firestore, constant.FIREBASE.COLLECTIONS.SPORTS);
    this.minigamesRepo = new FirestoreGenericRepository<minigame>(firestore, constant.FIREBASE.COLLECTIONS.MINIGAME);
    this.betMiniGamesRepo = new FirestoreGenericRepository<betMiniGame>(firestore, constant.FIREBASE.COLLECTIONS.BET_MINIGAME);
    this.pointHistoryRepo = new FirestoreGenericRepository<pointhistory>(firestore, constant.FIREBASE.COLLECTIONS.POINT_HISTORIES);
    this.editHistoriesRepo = new FirestoreGenericRepository<editHistory>(firestore, constant.FIREBASE.COLLECTIONS.EDIT_HISTORIES);
    this.cashHistoriesRepo = new FirestoreGenericRepository<cashHistory>(firestore, constant.FIREBASE.COLLECTIONS.CASH_HISTORIES);
    this.oddTypeRepo = new FirestoreGenericRepository<oddType>(firestore, constant.FIREBASE.COLLECTIONS.ODD_TYPES);
    this.settlementRepo = new FirestoreGenericRepository<settlement>(firestore, constant.FIREBASE.COLLECTIONS.SETTLEMENTS);
    this.virtualGameRepo = new FirestoreGenericRepository<virtualGame>(firestore, constant.FIREBASE.COLLECTIONS.VIRTUAL_GAME);
    this.soccerVirtualGameRepo = new FirestoreGenericRepository<soccerVirtualGame>(firestore, constant.FIREBASE.COLLECTIONS.BETS);
    this.raceVirtualGameRepo = new FirestoreGenericRepository<raceVirtualGame>(firestore, constant.FIREBASE.COLLECTIONS.BETS);
  }
}
