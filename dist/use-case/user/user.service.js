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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const configuration_1 = require("../../configuration");
const data_service_abstract_1 = require("../../core/abstract/data-services/data-service.abstract");
let UserService = exports.UserService = class UserService {
    constructor(db) {
        this.db = db;
    }
    async create(dto, req) {
        const user_tree_belong = await this.partnerTree(dto.recommend_id);
        const user = {
            id: dto.account_id,
            email: '',
            point: 0,
            user_tree_belong,
            ip: req.ip,
            type: configuration_1.default.USER.TYPE.NORMAL,
            created_at: new Date().getTime(),
            updated_at: new Date().getTime(),
            nickname: dto.account_id,
        };
        return this.db.userRepo.createDocumentData(user);
    }
    async partnerTree(recommend_id) {
        const partner_tree = [];
        const recommender = await this.db.userRepo.getDocumentData(recommend_id);
        if (!recommender) {
            return [];
        }
        partner_tree.push(recommend_id);
        if (recommender.user_tree_belong) {
            for (let i = 0; i < recommender.user_tree_belong.length; i++) {
                if (i < 2 && recommender.user_tree_belong[i]) {
                    partner_tree.push(recommender.user_tree_belong[i]);
                }
            }
        }
    }
};
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_service_abstract_1.IDataServices])
], UserService);
//# sourceMappingURL=user.service.js.map