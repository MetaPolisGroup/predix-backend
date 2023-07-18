"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cashHistoryProviders = void 0;
const cash_history_schema_1 = require("../schema/cash-history.schema");
exports.cashHistoryProviders = [
    {
        provide: "CASH_HISTORY_MODEL",
        useFactory: (connection) => connection.model("CashHistory", cash_history_schema_1.CashHistorySchema),
        inject: ["DATABASE_CONNECTION"],
    },
];
//# sourceMappingURL=cash-history.provider.js.map