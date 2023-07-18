"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataServicesModule = void 0;
const common_1 = require("@nestjs/common");
const firestore_module_1 = require("src/frameworks/firestore/firestore.module");
let DataServicesModule = exports.DataServicesModule = class DataServicesModule {
};
exports.DataServicesModule = DataServicesModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [firestore_module_1.FirestoreModule],
        exports: [firestore_module_1.FirestoreModule],
    })
], DataServicesModule);
//# sourceMappingURL=data-services.module.js.map