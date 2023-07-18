"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirestoreModule = void 0;
const common_1 = require("@nestjs/common");
const data_service_abstract_1 = require("src/core/abstracts/data-services/data-service.abstract");
const firestore_dataservices_1 = require("./firestore-dataservices");
let FirestoreModule = class FirestoreModule {
};
FirestoreModule = __decorate([
    (0, common_1.Module)({
        providers: [
            {
                provide: data_service_abstract_1.IDataServices,
                useClass: firestore_dataservices_1.FirestoreDataServices,
            },
        ],
        exports: [data_service_abstract_1.IDataServices],
    })
], FirestoreModule);
exports.FirestoreModule = FirestoreModule;
//# sourceMappingURL=firestore.module.js.map