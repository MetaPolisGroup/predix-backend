"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseProvider = void 0;
const mongoose_1 = require("mongoose");
exports.databaseProvider = [
    {
        provide: "DATABASE_CONNECTION",
        userFactory: () => mongoose_1.default.connect(`${process.env.MONGO_DB_HOST}`, {
            dbName: process.env.MONGO_DB,
            user: process.env.user,
            pass: process.env.password,
        }),
    },
];
//# sourceMappingURL=database.provider.js.map