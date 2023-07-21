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
const service_account_1 = require("./service-account");
const configuration_1 = require("../../configuration");
const firestore_generic_repository_1 = require("./firestore-generic-repository");
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
        this.userRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.USERS);
        this.cashHistoryRepoRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.CASH_HISTORIES);
        this.pointHistoryRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.POINT_HISTORIES);
        this.predictionRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.PREDICTIONS);
        this.productRepo = new firestore_generic_repository_1.FirestoreGenericRepository(firestore, configuration_1.default.FIREBASE.COLLECTIONS.PRODUCTS);
    }
};
exports.FirestoreDataServices = FirestoreDataServices = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], FirestoreDataServices);
//# sourceMappingURL=firestore-dataservices.js.map