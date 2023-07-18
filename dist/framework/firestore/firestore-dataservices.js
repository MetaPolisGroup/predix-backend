"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirestoreDataServices = void 0;
const common_1 = require("@nestjs/common");
const admin = require("firebase-admin");
const firestore_generic_repository_1 = require("./firestore-generic-repository");
const ticketRepo_extend_1 = require("./ticket/ticketRepo-extend");
const firebase_storage_generic_1 = require("./storage/firebase-storage-generic");
const configuration_1 = require("src/configuration");
const service_account_1 = require("./service-account");
let FirestoreDataServices = exports.FirestoreDataServices = class FirestoreDataServices {
    constructor() { }
    onApplicationBootstrap() {
        const app = admin.initializeApp({
            credential: admin.credential.cert(service_account_1.serviceAccount),
            storageBucket: configuration_1.default.STORAGE.BUCKET,
        }, configuration_1.default.FIREBASE.NAME);
        const firestore = app.firestore();
        firestore.settings({ ignoreUndefinedProperties: true });
        const bucket = app.storage().bucket();
        this.firestore = firestore;
        this.templateStorage = new firebase_storage_generic_1.FirebaseGenericStorage(bucket, configuration_1.default.STORAGE_PATH.TEMPLATE);
        this.announcementStorage = new firebase_storage_generic_1.FirebaseGenericStorage(bucket, configuration_1.default.STORAGE_PATH.ANNOUNCEMENT);
        this.eventStorage = new firebase_storage_generic_1.FirebaseGenericStorage(bucket, configuration_1.default.STORAGE_PATH.EVENT);
        this.bettingRulesStorage = new firebase_storage_generic_1.FirebaseGenericStorage(bucket, configuration_1.default.STORAGE_PATH.BETTING_RULES);
        this.popupStorage = new firebase_storage_generic_1.FirebaseGenericStorage(bucket, configuration_1.default.STORAGE_PATH.POPUP);
        this.otherStorage = new firebase_storage_generic_1.FirebaseGenericStorage(bucket, configuration_1.default.STORAGE_PATH.OTHER);
        this.nationsStorage = new firebase_storage_generic_1.FirebaseGenericStorage(bucket, configuration_1.default.STORAGE_PATH.NATIONS);
        this.usersRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.USERS);
        this.betsSportRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.BETS);
        this.betsMinigameRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.BETS);
        this.leaguesRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.LEAGUES);
        this.matchesRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.MATCHES);
        this.oddsRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.ODDS);
        this.partnersRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.PARTNERS);
        this.adminsRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.ADMINS);
        this.ticketsRepo = new ticketRepo_extend_1.FirestoreTicketRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.TICKETS);
        this.notificationsRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.NOTIFICATIONS);
        this.alertNotificationsRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.NOTIFICATIONS);
        this.preferencesRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.PREFERENCES);
        this.sportRuleRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.PREFERENCES);
        this.coinPowerballRuleRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.PREFERENCES);
        this.ladderRuleRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.PREFERENCES);
        this.virtualGameRuleRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.PREFERENCES);
        this.logsRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.LOGS);
        this.imagesRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.IMAGES);
        this.countriesRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.COUNTRIES);
        this.teamsRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.TEAMS);
        this.sportsRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.SPORTS);
        this.minigamesRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.MINIGAME);
        this.betMiniGamesRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.BET_MINIGAME);
        this.pointHistoryRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.POINT_HISTORIES);
        this.editHistoriesRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.EDIT_HISTORIES);
        this.cashHistoriesRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.CASH_HISTORIES);
        this.oddTypeRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.ODD_TYPES);
        this.settlementRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.SETTLEMENTS);
        this.virtualGameRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.VIRTUAL_GAME);
        this.soccerVirtualGameRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.BETS);
        this.raceVirtualGameRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.BETS);
    }
};
exports.FirestoreDataServices = FirestoreDataServices = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], FirestoreDataServices);
//# sourceMappingURL=firestore-dataservices.js.map