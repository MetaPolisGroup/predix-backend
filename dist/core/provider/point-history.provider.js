"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pointHistoryProviders = void 0;
const point_history_schema_1 = require("../schema/point-history.schema");
exports.pointHistoryProviders = [
    {
        provide: "POINT_HISTORY_MODEL",
        useFactory: (connection) => connection.model("PointHistory", point_history_schema_1.PointHistorySchema),
        inject: ["DATABASE_CONNECTION"],
    },
];
//# sourceMappingURL=point-history.provider.js.map